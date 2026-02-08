import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  User,
  MessageSquare,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
} from 'lucide-react';
import { leadsApi } from '@services/api';
import { useAuthStore } from '@store/authStore';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Skeleton } from '@components/ui/skeleton';
import { toast } from 'sonner';
import { cn, formatDate, formatDateTime } from '@lib/utils';
import { FunnelStage, LeadStatus, UserRole } from '@types/index';

const statusColors: Record<string, string> = {
  hot: 'bg-red-100 text-red-800 border-red-200',
  warm: 'bg-amber-100 text-amber-800 border-amber-200',
  cold: 'bg-blue-100 text-blue-800 border-blue-200',
};

const stageLabels: Record<string, string> = {
  [FunnelStage.NEW_LEAD]: 'New Lead',
  [FunnelStage.CONTACTED]: 'Contacted',
  [FunnelStage.QUALIFIED]: 'Qualified',
  [FunnelStage.FOLLOW_UP]: 'Follow Up',
  [FunnelStage.PROPOSAL]: 'Proposal',
  [FunnelStage.NEGOTIATION]: 'Negotiation',
  [FunnelStage.CONVERTED]: 'Converted',
  [FunnelStage.LOST]: 'Lost',
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuthStore();
  const [note, setNote] = useState('');

  const { data: leadData, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      const response = await leadsApi.getLead(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const updateStageMutation = useMutation({
    mutationFn: (stage: string) => leadsApi.changeStage(id!, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast.success('Stage updated successfully');
    },
    onError: () => {
      toast.error('Failed to update stage');
    },
  });

  const lead = leadData;

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lead not found</p>
        <Button onClick={() => navigate('/leads')} className="mt-4">
          Back to leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {lead.sender?.displayName || lead.sender?.username || 'Unknown Lead'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Lead ID: {lead.leadId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[lead.status]}>
            {lead.status}
          </Badge>
          {(hasRole(UserRole.ADMIN, UserRole.MANAGER)) && (
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Lead info */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Original message */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Original Message</CardTitle>
                </CardHeader>
                <CardContent>
                  {lead.content?.subject && (
                    <p className="font-medium mb-2">{lead.content.subject}</p>
                  )}
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {lead.content?.body}
                  </p>
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    Received on {formatDateTime(lead.timestamp)}
                  </div>
                </CardContent>
              </Card>

              {/* Lead details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lead Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Source</p>
                      <p className="font-medium capitalize">{lead.source.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{lead.leadType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-medium">{lead.score?.total}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interactions">
              <Card>
                <CardContent className="p-6">
                  {lead.interactions?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No interactions yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {lead.interactions?.map((interaction: any) => (
                        <div key={interaction._id} className="flex gap-4 pb-4 border-b last:border-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium">{interaction.type.replace(/_/g, ' ')}</p>
                            <p className="text-sm text-muted-foreground">{interaction.summary}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDateTime(interaction.conductedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks">
              <Card>
                <CardContent className="p-6">
                  {lead.tasks?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tasks assigned</p>
                      <Button className="mt-4" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lead.tasks?.map((task: any) => (
                        <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Due: {formatDate(task.dueDate)}
                            </p>
                          </div>
                          <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                            {task.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" className="shrink-0">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {lead.notes?.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No notes yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {lead.notes?.map((note: any) => (
                        <div key={note._id} className="p-4 bg-muted rounded-lg">
                          <p className="text-sm">{note.content}</p>
                          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{note.createdBy?.firstName} {note.createdBy?.lastName}</span>
                            <span>•</span>
                            <span>{formatDateTime(note.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Sidebar */}
        <div className="space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.sender?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.sender.email}</span>
                </div>
              )}
              {lead.sender?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.sender.phone}</span>
                </div>
              )}
              {lead.sender?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{lead.sender.location}</span>
                </div>
              )}
              {lead.sender?.profileUrl && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={lead.sender.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funnel stage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Funnel Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={lead.funnelStage}
                onValueChange={(value) => updateStageMutation.mutate(value)}
                disabled={updateStageMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(FunnelStage).map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stageLabels[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-4 space-y-2">
                {Object.values(FunnelStage).map((stage, index) => (
                  <div
                    key={stage}
                    className={cn(
                      'flex items-center gap-2 text-sm',
                      lead.funnelStage === stage && 'font-medium text-primary'
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        lead.funnelStage === stage && 'bg-primary',
                        Object.values(FunnelStage).indexOf(lead.funnelStage) > index && 'bg-green-500',
                        Object.values(FunnelStage).indexOf(lead.funnelStage) < index && 'bg-muted'
                      )}
                    />
                    {stageLabels[stage]}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          {(hasRole(UserRole.ADMIN, UserRole.MANAGER)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.assignedTo ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {lead.assignedTo.firstName?.[0]}{lead.assignedTo.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">{lead.assignedTo.firstName} {lead.assignedTo.lastName}</p>
                      <p className="text-sm text-muted-foreground">{lead.assignedTo.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm mb-3">Not assigned</p>
                    <Button size="sm">Assign to user</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lead.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {lead.tags?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-1" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';
