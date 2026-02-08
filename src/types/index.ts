// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  COUNSELOR = 'counselor',
  AGENT = 'agent'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  department?: string;
  assignedLeads?: string[];
  maxLeadsCapacity?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  department?: string;
}

// ============================================
// LEAD TYPES
// ============================================

export enum LeadSource {
  INSTAGRAM_DM = 'instagram_dm',
  INSTAGRAM_COMMENT = 'instagram_comment',
  INSTAGRAM_AD = 'instagram_ad',
  INSTAGRAM_FOLLOW = 'instagram_follow',
  FACEBOOK_MESSAGE = 'facebook_message',
  FACEBOOK_COMMENT = 'facebook_comment',
  FACEBOOK_AD = 'facebook_ad',
  WHATSAPP = 'whatsapp',
  LINKEDIN_MESSAGE = 'linkedin_message',
  LINKEDIN_COMMENT = 'linkedin_comment',
  GOOGLE_ADS = 'google_ads',
  EMAIL = 'email',
  MANUAL = 'manual',
  WEBSITE = 'website',
  REFERRAL = 'referral'
}

export enum LeadType {
  MESSAGE = 'message',
  COMMENT = 'comment',
  AD = 'ad',
  FOLLOW = 'follow',
  EMAIL = 'email',
  CALL = 'call',
  FORM = 'form'
}

export enum LeadStatus {
  HOT = 'hot',
  WARM = 'warm',
  COLD = 'cold'
}

export enum FunnelStage {
  NEW_LEAD = 'new_lead',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  FOLLOW_UP = 'follow_up',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CONVERTED = 'converted',
  LOST = 'lost'
}

export interface SenderDetails {
  platformUserId: string;
  username?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  profileUrl?: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
  metadata?: Record<string, any>;
}

export interface CampaignMetadata {
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  adId?: string;
  formId?: string;
  creativeId?: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  costPerLead?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

export interface LeadScore {
  total: number;
  intentScore: number;
  engagementScore: number;
  sourceScore: number;
  frequencyScore: number;
  campaignScore: number;
  manualOverride?: number;
  calculatedAt: string;
  version: number;
}

export interface Lead {
  _id: string;
  leadId: string;
  source: LeadSource;
  leadType: LeadType;
  sender: SenderDetails;
  content: {
    subject?: string;
    body: string;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    rawData?: Record<string, any>;
  };
  timestamp: string;
  campaignMetadata?: CampaignMetadata;
  score: LeadScore;
  status: LeadStatus;
  funnelStage: FunnelStage;
  assignedTo?: User | string;
  assignedBy?: User | string;
  assignedAt?: string;
  tags: string[];
  notes?: Note[];
  interactions?: Interaction[];
  tasks?: Task[];
  customFields?: Record<string, any>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  timeInStages?: Record<string, number>;
  lastInteractionAt?: string;
  nextFollowUpAt?: string;
  conversionValue?: number;
  convertedAt?: string;
}

// ============================================
// TASK TYPES
// ============================================

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskType {
  FOLLOW_UP = 'follow_up',
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  DEMO = 'demo',
  PROPOSAL = 'proposal',
  RESEARCH = 'research',
  DATA_ENTRY = 'data_entry',
  OTHER = 'other'
}

export interface Task {
  _id: string;
  taskId: string;
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: User | string;
  assignedBy: User | string;
  leadId?: Lead | string;
  dueDate: string;
  completedAt?: string;
  completedBy?: User | string;
  reminders?: Array<{
    time: string;
    sent: boolean;
    sentAt?: string;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;
  notes?: string;
  isOverdue?: boolean;
  timeRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// NOTE TYPES
// ============================================

export interface Note {
  _id: string;
  noteId: string;
  leadId: string;
  content: string;
  createdBy: User;
  createdByRole: UserRole;
  isPrivate: boolean;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INTERACTION TYPES
// ============================================

export enum InteractionType {
  CALL_INBOUND = 'call_inbound',
  CALL_OUTBOUND = 'call_outbound',
  EMAIL_INBOUND = 'email_inbound',
  EMAIL_OUTBOUND = 'email_outbound',
  SMS_INBOUND = 'sms_inbound',
  SMS_OUTBOUND = 'sms_outbound',
  WHATSAPP_INBOUND = 'whatsapp_inbound',
  WHATSAPP_OUTBOUND = 'whatsapp_outbound',
  MEETING = 'meeting',
  VIDEO_CALL = 'video_call',
  NOTE = 'note',
  SYSTEM = 'system'
}

export enum InteractionOutcome {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  NO_ANSWER = 'no_answer',
  CALLBACK_REQUESTED = 'callback_requested',
  NOT_INTERESTED = 'not_interested',
  FOLLOW_UP_REQUIRED = 'follow_up_required',
  CONVERTED = 'converted'
}

export interface Interaction {
  _id: string;
  interactionId: string;
  leadId: string;
  type: InteractionType;
  outcome: InteractionOutcome;
  summary: string;
  details?: string;
  duration?: number;
  conductedBy: User;
  conductedAt: string;
  scheduledAt?: string;
  completedAt?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ACTIVITY TYPES
// ============================================

export enum ActivityType {
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  LEAD_DELETED = 'lead_deleted',
  LEAD_ASSIGNED = 'lead_assigned',
  LEAD_REASSIGNED = 'lead_reassigned',
  LEAD_SCORED = 'lead_scored',
  STAGE_CHANGED = 'stage_changed',
  STATUS_CHANGED = 'status_changed',
  NOTE_ADDED = 'note_added',
  INTERACTION_LOGGED = 'interaction_logged',
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  TASK_DELETED = 'task_deleted',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted'
}

export enum ActivityPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Activity {
  _id: string;
  activityId: string;
  type: ActivityType;
  priority: ActivityPriority;
  description: string;
  performedBy: User;
  performedByRole: UserRole;
  leadId?: Lead | string;
  taskId?: Task | string;
  userId?: User | string;
  metadata?: {
    previousValue?: any;
    newValue?: any;
    changes?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    ipAddress?: string;
    userAgent?: string;
    source?: string;
    [key: string]: any;
  };
  timestamp: string;
  isSystemGenerated: boolean;
  createdAt: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  leads: {
    total: number;
    newToday: number;
    hot: number;
    warm: number;
    cold: number;
    converted: number;
    lost: number;
    conversionRate: number;
  };
  funnel: Array<{
    stage: FunnelStage;
    count: number;
    percentage: number;
  }>;
  sources: Array<{
    source: LeadSource;
    count: number;
  }>;
  tasks: {
    total: number;
    pending: number;
    overdue: number;
    dueToday: number;
  };
  activities: Activity[];
  team: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    avatar?: string;
    totalLeads: number;
    activeLeads: number;
    convertedLeads: number;
    conversionRate: number;
  }>;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================
// PERMISSION TYPES
// ============================================

export enum Permission {
  LEAD_CREATE = 'lead:create',
  LEAD_READ = 'lead:read',
  LEAD_UPDATE = 'lead:update',
  LEAD_DELETE = 'lead:delete',
  LEAD_ASSIGN = 'lead:assign',
  LEAD_REASSIGN = 'lead:reassign',
  LEAD_SCORE = 'lead:score',
  LEAD_EXPORT = 'lead:export',
  LEAD_IMPORT = 'lead:import',
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage_roles',
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',
  INTEGRATION_CONNECT = 'integration:connect',
  INTEGRATION_DISCONNECT = 'integration:disconnect',
  INTEGRATION_CONFIGURE = 'integration:configure',
  AUDIT_VIEW = 'audit:view',
  AUDIT_EXPORT = 'audit:export'
}

export const RolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.MANAGER]: [
    Permission.LEAD_CREATE,
    Permission.LEAD_READ,
    Permission.LEAD_UPDATE,
    Permission.LEAD_ASSIGN,
    Permission.LEAD_REASSIGN,
    Permission.LEAD_SCORE,
    Permission.LEAD_EXPORT,
    Permission.LEAD_IMPORT,
    Permission.USER_READ,
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.TASK_DELETE,
    Permission.TASK_ASSIGN,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
    Permission.SETTINGS_VIEW,
    Permission.AUDIT_VIEW
  ],
  [UserRole.COUNSELOR]: [
    Permission.LEAD_READ,
    Permission.LEAD_UPDATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
    Permission.ANALYTICS_VIEW
  ],
  [UserRole.AGENT]: [
    Permission.LEAD_READ,
    Permission.LEAD_UPDATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE
  ]
};

// ============================================
// UI TYPES
// ============================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permissions?: Permission[];
  roles?: UserRole[];
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface Column<T = any> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}
