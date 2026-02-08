import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  User,
  Shield,
  Users as UsersIcon,
} from 'lucide-react';
import { usersApi } from '@services/api';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Skeleton } from '@components/ui/skeleton';
import { cn, getInitials } from '@lib/utils';
import { UserRole, UserStatus } from '@types/index';

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  counselor: 'bg-green-100 text-green-800',
  agent: 'bg-gray-100 text-gray-800',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

export default function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', { roleFilter, statusFilter }],
    queryFn: async () => {
      const params: Record<string, any> = {};

if (roleFilter !== 'all') params.role = roleFilter;
if (statusFilter !== 'all') params.status = statusFilter;
      const response = await usersApi.getUsers(params);
      return response.data;
    },
  });

  const users = usersData?.data || [];

  const filteredUsers = users.filter((user: any) =>
    searchQuery === '' ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and permissions
          </p>
        </div>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Roles</SelectItem>
    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
    <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
    <SelectItem value={UserRole.COUNSELOR}>Counselor</SelectItem>
    <SelectItem value={UserRole.AGENT}>Agent</SelectItem>
  </SelectContent>
</Select>


<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
    <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
    <SelectItem value={UserStatus.SUSPENDED}>Suspended</SelectItem>
  </SelectContent>
</Select>

          </div>
        </CardContent>
      </Card>

      {/* Users grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24" />
              </CardContent>
            </Card>
          ))
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user: any) => (
            <Card
              key={user._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/users/${user._id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium">
                      {getInitials(`${user.firstName} ${user.lastName}`)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={roleColors[user.role]}>
                          {user.role}
                        </Badge>
                        <Badge className={statusColors[user.status]}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/users/${user._id}`);
                      }}>
                        View profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        Edit user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{user.department || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leads</p>
                    <p className="font-medium">{user.assignedLeads?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
