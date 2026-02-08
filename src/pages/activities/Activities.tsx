import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  User,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import { activitiesApi } from '@services/api';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardContent } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Skeleton } from '@components/ui/skeleton';
import { cn, formatRelativeTime } from '@lib/utils';
import { ActivityType, ActivityPriority } from '@types/index';

const activityIcons: Record<string, React.ElementType> = {
  lead_created: Target,
  lead_updated: Target,
  lead_deleted: AlertCircle,
  lead_assigned: User,
  lead_reassigned: User,
  lead_scored: CheckCircle,
  stage_changed: CheckCircle,
  status_changed: AlertCircle,
  note_added: Target,
  interaction_logged: Clock,
  task_created: CheckCircle,
  task_updated: CheckCircle,
  task_completed: CheckCircle,
  task_deleted: AlertCircle,
  user_login: User,
  user_logout: User,
  user_created: User,
  user_updated: User,
  user_deleted: AlertCircle,
};


const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export default function Activities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
const [priorityFilter, setPriorityFilter] = useState('all');


  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', { typeFilter, priorityFilter }],
    queryFn: async () => {
      const params: Record<string, any> = { limit: 50 };
      if (typeFilter !== 'all') params.type = typeFilter;
if (priorityFilter !== 'all') params.priority = priorityFilter;
      const response = await activitiesApi.getActivities(params);
      return response.data;
    },
  });

  const activities = activitiesData?.data || [];

  const filteredActivities = activities.filter((activity: any) =>
    searchQuery === '' ||
    activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground mt-1">
          Track all actions and changes in the system
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lead_created">Lead Created</SelectItem>
                <SelectItem value="lead_updated">Lead Updated</SelectItem>
                <SelectItem value="lead_assigned">Lead Assigned</SelectItem>
                <SelectItem value="task_created">Task Created</SelectItem>
                <SelectItem value="task_completed">Task Completed</SelectItem>
                <SelectItem value="user_login">User Login</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-16" />
                </div>
              ))
            ) : filteredActivities.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              filteredActivities.map((activity: any) => {
                const Icon = activityIcons[activity.type] || Clock;
                return (
                  <div
                    key={activity._id}
                    className="p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                      activity.isSystemGenerated ? 'bg-gray-100' : 'bg-primary/10'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        activity.isSystemGenerated ? 'text-gray-500' : 'text-primary'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{activity.performedBy?.firstName} {activity.performedBy?.lastName}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(activity.timestamp)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors[activity.priority]}>
                            {activity.priority}
                          </Badge>
                          {activity.isSystemGenerated && (
                            <Badge variant="outline">System</Badge>
                          )}
                        </div>
                      </div>
                      {activity.leadId && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Related lead: </span>
                          <span className="text-primary cursor-pointer hover:underline">
                            {activity.leadId.sender?.displayName || activity.leadId.leadId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
