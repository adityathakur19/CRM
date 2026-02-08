import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ArrowUpDown,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import { leadsApi } from '@services/api';
import { useAuthStore } from '@store/authStore';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { Card, CardContent } from '@components/ui/card';
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
import { cn, formatDate, truncateText } from '@lib/utils';
import { LeadStatus, LeadSource, FunnelStage, UserRole } from '@types/index';

const statusColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-800 border-red-200',
  warm: 'bg-amber-100 text-amber-800 border-amber-200',
  cold: 'bg-blue-100 text-blue-800 border-blue-200',
};

const sourceIcons: Record<string, string> = {
  instagram_dm: 'IG',
  instagram_comment: 'IG',
  instagram_ad: 'IG',
  facebook_message: 'FB',
  facebook_comment: 'FB',
  facebook_ad: 'FB',
  whatsapp: 'WA',
  linkedin_message: 'LI',
  linkedin_comment: 'LI',
  google_ads: 'G',
  email: 'EM',
  manual: 'MN',
  website: 'WB',
  referral: 'RF',
};

export default function Leads() {
  const navigate = useNavigate();
  const { hasRole } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', { searchQuery, statusFilter, sourceFilter, stageFilter, sortBy, sortOrder }],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: 1,
        limit: 50,
        sortBy,
        sortOrder,
      };
      
      if (searchQuery) params.search = searchQuery;
      const [statusFilter, setStatusFilter] = useState<string>('all');
const [sourceFilter, setSourceFilter] = useState<string>('all');
const [stageFilter, setStageFilter] = useState<string>('all');

      
      const response = await leadsApi.getLeads(params);
      return response.data;
    },
  });

  const leads = leadsData?.data || [];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your leads
          </p>
        </div>
        <Button onClick={() => navigate('/leads/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
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
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select
  value={statusFilter}
  onValueChange={(v) => setStatusFilter(v)}
>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="hot">Hot</SelectItem>
    <SelectItem value="warm">Warm</SelectItem>
    <SelectItem value="cold">Cold</SelectItem>
  </SelectContent>
</Select>


<Select
  value={sourceFilter}
  onValueChange={(v) => setSourceFilter(v)}
>
  <SelectTrigger className="w-[160px]">
    <SelectValue placeholder="Source" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Sources</SelectItem>
    {Object.values(LeadSource).map((source) => (
      <SelectItem key={source} value={source}>
        {source.replace(/_/g, ' ').toUpperCase()}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


<Select
  value={stageFilter}
  onValueChange={(v) => setStageFilter(v)}
>
  <SelectTrigger className="w-[160px]">
    <SelectValue placeholder="Stage" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Stages</SelectItem>
    {Object.values(FunnelStage).map((stage) => (
      <SelectItem key={stage} value={stage}>
        {stage.replace(/_/g, ' ').toUpperCase()}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            {(statusFilter || sourceFilter || stageFilter || searchQuery) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusFilter('');
                  setSourceFilter('');
                  setStageFilter('');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leads table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    <button
                      onClick={() => handleSort('sender.displayName')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Lead
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Stage</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Score</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Assigned</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4"><Skeleton className="h-10 w-48" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-10" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="py-3 px-4"><Skeleton className="h-8 w-8 rounded-full" /></td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead: any) => (
                    <tr
                      key={lead._id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/leads/${lead._id}`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {lead.sender?.displayName?.[0] || lead.sender?.username?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {lead.sender?.displayName || lead.sender?.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {truncateText(lead.content?.body, 40)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                            {sourceIcons[lead.source] || '?'}
                          </span>
                          <span className="text-sm capitalize">
                            {lead.source.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={statusColors[lead.status]}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm capitalize">
                          {lead.funnelStage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                lead.score?.total >= 80 && 'bg-red-500',
                                lead.score?.total >= 50 && lead.score?.total < 80 && 'bg-amber-500',
                                lead.score?.total < 50 && 'bg-blue-500'
                              )}
                              style={{ width: `${lead.score?.total || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{lead.score?.total || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {lead.assignedTo ? (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                            {lead.assignedTo.firstName?.[0]}{lead.assignedTo.lastName?.[0]}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/leads/${lead._id}`);
                            }}>
                              View details
                            </DropdownMenuItem>
                            {(hasRole(UserRole.ADMIN, UserRole.MANAGER)) && (
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                Assign to...
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              Add note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
