import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { dashboardApi } from '@services/api';
import { useAuthStore } from '@store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Skeleton } from '@components/ui/skeleton';
import { cn, formatNumber, formatRelativeTime } from '@lib/utils';
import { LeadStatus, FunnelStage, UserRole } from '@types/index';

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

export default function Dashboard() {
  const { user, hasRole } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardStats();
      return response.data.data;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const { leads, funnel, sources, tasks, activities, team } = stats || {};

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName}! Here's what's happening today.
          </p>
        </div>
        <Button>+ New Lead</Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={leads?.total || 0}
          change={leads?.newToday || 0}
          changeLabel="new today"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Hot Leads"
          value={leads?.hot || 0}
          change={Math.round(((leads?.hot || 0) / (leads?.total || 1)) * 100)}
          changeLabel="of total"
          icon={Target}
          trend="neutral"
          variant="danger"
        />
        <StatCard
          title="Conversion Rate"
          value={`${leads?.conversionRate || 0}%`}
          change={leads?.converted || 0}
          changeLabel="converted"
          icon={TrendingUp}
          trend="up"
          variant="success"
        />
        <StatCard
          title="Pending Tasks"
          value={tasks?.pending || 0}
          change={tasks?.overdue || 0}
          changeLabel="overdue"
          icon={CheckCircle}
          trend={tasks?.overdue ? 'down' : 'up'}
          variant={tasks?.overdue ? 'warning' : 'default'}
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Funnel visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnel?.map((stage: any) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">
                    {stageLabels[stage.stage]}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm">
                    <span className="font-semibold">{stage.count}</span>
                    <span className="text-muted-foreground ml-1">
                      ({stage.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lead status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Hot</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">{leads?.hot || 0}</span>
                  <Badge variant="outline" className={statusColors.hot}>
                    High Priority
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm">Warm</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">{leads?.warm || 0}</span>
                  <Badge variant="outline" className={statusColors.warm}>
                    Medium Priority
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Cold</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">{leads?.cold || 0}</span>
                  <Badge variant="outline" className={statusColors.cold}>
                    Low Priority
                  </Badge>
                </div>
              </div>
            </div>

            {/* Top sources */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium mb-3">Top Sources</h4>
              <div className="space-y-2">
                {sources?.slice(0, 5).map((source: any) => (
                  <div key={source.source} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">
                      {source.source.replace(/_/g, ' ')}
                    </span>
                    <span className="font-medium">{source.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity & Team performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities?.slice(0, 5).map((activity: any) => (
                <div key={activity._id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.performedBy?.firstName} {activity.performedBy?.lastName} • {' '}
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team performance */}
        {(hasRole(UserRole.ADMIN, UserRole.MANAGER)) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Performance</CardTitle>
              <Button variant="ghost" size="sm">View all</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team?.slice(0, 5).map((member: any) => (
                  <div key={member._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.totalLeads} leads</p>
                      <p className="text-xs text-muted-foreground">
                        {member.conversionRate}% conversion
                      </p>
                    </div>
                  </div>
                ))}
                {(!team || team.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No team members
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function StatCard({ title, value, change, changeLabel, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200',
  };

  return (
    <Card className={cn(variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            variant === 'default' && 'bg-primary/10',
            variant === 'success' && 'bg-green-100',
            variant === 'warning' && 'bg-amber-100',
            variant === 'danger' && 'bg-red-100',
          )}>
            <Icon className={cn(
              'w-5 h-5',
              variant === 'default' && 'text-primary',
              variant === 'success' && 'text-green-600',
              variant === 'warning' && 'text-amber-600',
              variant === 'danger' && 'text-red-600',
            )} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={cn(
            'font-medium',
            trend === 'up' && 'text-green-600',
            trend === 'down' && 'text-red-600',
            trend === 'neutral' && 'text-muted-foreground',
          )}>
            {trend === 'up' && '+'}{change}
          </span>
          <span className="text-muted-foreground ml-1">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64 mt-1" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-16 mt-2" />
              <Skeleton className="h-4 w-32 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
