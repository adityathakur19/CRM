import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
} from 'lucide-react';
import { tasksApi } from '@services/api';
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
import { cn, formatDate } from '@lib/utils';
import { TaskStatus, TaskPriority } from '@types/index';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
  overdue: 'bg-red-100 text-red-800',
};

export default function Tasks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { statusFilter, priorityFilter }],
    queryFn: async () => {
      const params: Record<string, any> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
if (priorityFilter !== 'all') params.priority = priorityFilter;
      const response = await tasksApi.getTasks(params);
      return response.data;
    },
  });

  const tasks = tasksData?.data || [];

  const filteredTasks = tasks.filter((task: any) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your tasks and follow-ups
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Task
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
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="pending">Pending</SelectItem>
    <SelectItem value="in_progress">In Progress</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
    <SelectItem value="overdue">Overdue</SelectItem>
  </SelectContent>
</Select>


<Select value={priorityFilter} onValueChange={setPriorityFilter}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Priorities</SelectItem>
    <SelectItem value="urgent">Urgent</SelectItem>
    <SelectItem value="high">High</SelectItem>
    <SelectItem value="medium">Medium</SelectItem>
    <SelectItem value="low">Low</SelectItem>
  </SelectContent>
</Select>

          </div>
        </CardContent>
      </Card>

      {/* Tasks list */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16" />
              </CardContent>
            </Card>
          ))
        ) : filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task: any) => (
            <Card
              key={task._id}
              className={cn(
                'cursor-pointer hover:shadow-md transition-shadow',
                task.status === 'completed' && 'opacity-60'
              )}
              onClick={() => navigate(`/tasks/${task._id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2',
                      task.priority === 'urgent' && 'bg-red-500',
                      task.priority === 'high' && 'bg-orange-500',
                      task.priority === 'medium' && 'bg-yellow-500',
                      task.priority === 'low' && 'bg-green-500'
                    )} />
                    <div>
                      <p className={cn(
                        'font-medium',
                        task.status === 'completed' && 'line-through'
                      )}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.dueDate)}
                        </div>
                        {task.leadId && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            Related to: {task.leadId.sender?.displayName || task.leadId.leadId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                    <Badge className={statusColors[task.status]}>
                      {task.status.replace('_', ' ')}
                    </Badge>
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
