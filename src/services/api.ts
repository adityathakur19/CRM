import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  login: (email: string, password: string, rememberMe = false) =>
    api.post('/auth/login', { email, password, rememberMe }),
  
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    department?: string;
  }) => api.post('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  getCurrentUser: () => api.get('/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
};

export const leadsApi = {
  getLeads: (params?: Record<string, any>) => api.get('/leads', { params }),
  
  getLead: (id: string) => api.get(`/leads/${id}`),
  
  createLead: (data: any) => api.post('/leads', data),
  
  updateLead: (id: string, data: any) => api.put(`/leads/${id}`, data),
  
  deleteLead: (id: string) => api.delete(`/leads/${id}`),
  
  assignLead: (id: string, userId: string) =>
    api.post(`/leads/${id}/assign`, { userId }),
  
  updateLeadScore: (id: string, manualScore: number) =>
    api.post(`/leads/${id}/score`, { manualScore }),
  
  changeStage: (id: string, stage: string) =>
    api.post(`/leads/${id}/stage`, { stage }),
  
  getLeadStats: (params?: Record<string, any>) =>
    api.get('/leads/stats', { params }),
  
  getMyLeads: (params?: Record<string, any>) =>
    api.get('/leads/my-leads', { params }),
  
  bulkAssign: (leadIds: string[], userId: string) =>
    api.post('/leads/bulk-assign', { leadIds, userId }),
};

export const usersApi = {
  getUsers: (params?: Record<string, any>) => api.get('/users', { params }),
  
  getUser: (id: string) => api.get(`/users/${id}`),
  
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  
  updateUserRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }),
  
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  
  suspendUser: (id: string, reason?: string) =>
    api.post(`/users/${id}/suspend`, { reason }),
  
  activateUser: (id: string) => api.post(`/users/${id}/activate`),
  
  getUserStats: (id: string, params?: Record<string, any>) =>
    api.get(`/users/${id}/stats`, { params }),
  
  getUserActivity: (id: string, params?: Record<string, any>) =>
    api.get(`/users/${id}/activity`, { params }),
  
  getTeamMembers: () => api.get('/users/team'),
};

export const tasksApi = {
  getTasks: (params?: Record<string, any>) => api.get('/tasks', { params }),
  
  getTask: (id: string) => api.get(`/tasks/${id}`),
  
  createTask: (data: any) => api.post('/tasks', data),
  
  updateTask: (id: string, data: any) => api.put(`/tasks/${id}`, data),
  
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  
  completeTask: (id: string) => api.post(`/tasks/${id}/complete`),
  
  getMyTasks: (params?: Record<string, any>) =>
    api.get('/tasks/my-tasks', { params }),
  
  getUpcomingTasks: (hours?: number) =>
    api.get('/tasks/upcoming', { params: { hours } }),
  
  getOverdueTasks: (params?: Record<string, any>) =>
    api.get('/tasks/overdue', { params }),
  
  getTaskStats: (userId?: string) =>
    api.get('/tasks/stats', { params: userId ? { userId } : undefined }),
};

export const activitiesApi = {
  getActivities: (params?: Record<string, any>) =>
    api.get('/activities', { params }),
  
  getActivity: (id: string) => api.get(`/activities/${id}`),
  
  getRecentActivities: (limit?: number, excludeSystem?: boolean) =>
    api.get('/activities/recent', { params: { limit, excludeSystem } }),
  
  getActivityStats: (params?: Record<string, any>) =>
    api.get('/activities/stats', { params }),
  
  getLeadActivities: (leadId: string, params?: Record<string, any>) =>
    api.get(`/leads/${leadId}/activities`, { params }),
};

export const dashboardApi = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  
  getPerformanceMetrics: (params?: Record<string, any>) =>
    api.get('/dashboard/performance', { params }),
  
  getLeadTrends: (days?: number) =>
    api.get('/dashboard/trends', { params: { days } }),
  
  getUpcomingItems: () => api.get('/dashboard/upcoming'),
};

export default api;
