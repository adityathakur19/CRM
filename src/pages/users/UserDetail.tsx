import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Building, Calendar, Users, Target } from 'lucide-react';
import { usersApi } from '@services/api';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Skeleton } from '@components/ui/skeleton';
import { cn, formatDate, getInitials } from '@lib/utils';

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

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await usersApi.getUser(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const { data: statsData } = useQuery({
    queryKey: ['user-stats', id],
    queryFn: async () => {
      const response = await usersApi.getUserStats(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const user = userData;
  const stats = statsData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
        <Button onClick={() => navigate('/users')} className="mt-4">
          Back to users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-medium">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={roleColors[user.role]}>{user.role}</Badge>
                <Badge className={statusColors[user.status]}>{user.status}</Badge>
              </div>
            </div>
          </div>
        </div>
        <Button variant="outline">Edit Profile</Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Contact info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{user.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Leads</p>
                    <p className="text-2xl font-bold">{stats?.totalLeadsAssigned || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Leads</p>
                    <p className="text-2xl font-bold">{stats?.activeLeads || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Converted</p>
                    <p className="text-2xl font-bold">{stats?.convertedLeads || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{stats?.conversionRate || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {user.assignedLeads?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No leads assigned
                </p>
              ) : (
                <div className="space-y-3">
                  {user.assignedLeads?.slice(0, 10).map((lead: any) => (
                    <div
                      key={lead._id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      <div>
                        <p className="font-medium">{lead.sender?.displayName || lead.leadId}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.funnelStage.replace(/_/g, ' ')} • {lead.status}
                        </p>
                      </div>
                      <Badge variant="outline">{lead.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-8">
                Activity feed coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
