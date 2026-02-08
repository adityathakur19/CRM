import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { tasksApi } from '@services/api';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { cn, formatDate, formatDateTime } from '@lib/utils';

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

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: taskData, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const response = await tasksApi.getTask(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const task = taskData;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Task not found</p>
        <Button onClick={() => navigate('/tasks')} className="mt-4">
          Back to tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
            <p className="text-muted-foreground text-sm">
              Task ID: {task.taskId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
          <Badge className={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {task.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{task.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{formatDate(task.dueDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Assigned To</p>
                  <p className="font-medium">
                    {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDateTime(task.createdAt)}</p>
                </div>
              </div>

              {task.completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{formatDateTime(task.completedAt)}</p>
                  </div>
                </div>
              )}

              {task.leadId && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Related Lead</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/leads/${task.leadId._id}`)}
                  >
                    View Lead
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {task.status !== 'completed' && task.status !== 'cancelled' && (
            <Card>
              <CardContent className="p-4">
                <Button className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
