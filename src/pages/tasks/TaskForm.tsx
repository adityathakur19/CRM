// File: Frontend/src/pages/tasks/TaskForm.tsx
// COMPLETE FIX: Null-safe rendering for all SelectItems

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { tasksApi, leadsApi, usersApi } from '@services/api';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Label } from '@components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { TaskType, TaskPriority } from '@types/index';
import { useAuthStore } from '@store/authStore';

export default function TaskForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: TaskType.FOLLOW_UP,
    priority: TaskPriority.MEDIUM,
    assignedTo: user?._id || '',
    leadId: '',
    dueDate: '',
    notes: '',
  });

  // Fetch users
  const { 
    data: usersResponse, 
    isLoading: isLoadingUsers,
    isError: isUsersError 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.getUsers();
      return response.data;
    },
  });

  // Fetch leads
  const { 
    data: leadsResponse, 
    isLoading: isLoadingLeads,
    isError: isLeadsError 
  } = useQuery({
    queryKey: ['leads', { limit: 100 }],
    queryFn: async () => {
      const response = await leadsApi.getLeads({ page: 1, limit: 100 });
      return response.data;
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => tasksApi.createTask(data),
    onSuccess: () => {
      toast.success('Task created successfully');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate('/tasks');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create task');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      toast.error('Please provide a task title');
      return;
    }
    
    if (!formData.assignedTo) {
      toast.error('Please assign the task to someone');
      return;
    }

    if (!formData.dueDate) {
      toast.error('Please set a due date');
      return;
    }

    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      type: formData.type,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      leadId: formData.leadId || undefined,
      notes: formData.notes || undefined,
    };

    createTaskMutation.mutate(taskData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Extract and filter valid users and leads
  const rawUsers = usersResponse?.data || [];
  const rawLeads = leadsResponse?.data || [];

  // Filter out any invalid users (must have _id, firstName, and lastName)
  const users = rawUsers.filter((u: any) => 
    u && 
    u._id && 
    typeof u.firstName === 'string' && 
    typeof u.lastName === 'string'
  );

  // Filter out any invalid leads (must have _id)
  const leads = rawLeads.filter((l: any) => l && l._id);

  // Loading state
  if (isLoadingUsers || isLoadingLeads) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
          <p className="text-muted-foreground mt-1">
            Add a new task or follow-up
          </p>
        </div>

        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading form data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isUsersError || isLeadsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </Button>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600 mb-4">Failed to load form data</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tasks')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
        <p className="text-muted-foreground mt-1">
          Add a new task or follow-up
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Task Information */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Follow up with lead"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about the task..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Task Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="data_entry">Data Entry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assignment and Due Date */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To *</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => handleInputChange('assignedTo', value)}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.length === 0 ? (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      ) : (
                        users.map((u: any) => {
                          const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User';
                          return (
                            <SelectItem key={u._id} value={u._id}>
                              {displayName}
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadId">Related Lead (Optional)</Label>
                <Select
                  value={formData.leadId}
                  onValueChange={(value) => handleInputChange('leadId', value)}
                >
                  <SelectTrigger id="leadId">
                    <SelectValue placeholder="Select a lead (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {leads.length === 0 ? (
                      <SelectItem value="no-leads" disabled>
                        No leads available
                      </SelectItem>
                    ) : (
                      leads.map((lead: any) => {
                        // Safely get lead display name
                        const displayName = 
                          lead.sender?.displayName || 
                          lead.sender?.username || 
                          lead.sender?.email || 
                          lead.leadId ||
                          `Lead ${lead._id.slice(-6)}`;
                        
                        return (
                          <SelectItem key={lead._id} value={lead._id}>
                            {displayName}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes or context..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tasks')}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}