import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, AuthTokens } from '@types/index';
import { authApi } from '@services/api';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    phone?: string;
    department?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password, rememberMe);
          const { user, tokens } = response.data.data;
          
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          const { user, tokens } = response.data.data;
          
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authApi.refreshToken(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
          
          set({
            accessToken,
            refreshToken: newRefreshToken,
          });
          return true;
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      fetchCurrentUser: async () => {
        try {
          const response = await authApi.getCurrentUser();
          set({ user: response.data.data.user });
        } catch (error) {
          console.error('Fetch current user error:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;

        // Admin has all permissions
        if (user.role === UserRole.ADMIN) return true;

        // Check role-based permissions
        const rolePermissions: Record<UserRole, string[]> = {
          [UserRole.ADMIN]: ['*'],
          [UserRole.MANAGER]: [
            'lead:create', 'lead:read', 'lead:update', 'lead:assign', 'lead:reassign',
            'lead:score', 'lead:export', 'lead:import',
            'user:read',
            'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign',
            'analytics:view', 'analytics:export',
            'settings:view',
            'audit:view',
          ],
          [UserRole.COUNSELOR]: [
            'lead:read', 'lead:update',
            'task:read', 'task:update',
            'analytics:view',
          ],
          [UserRole.AGENT]: [
            'lead:read', 'lead:update',
            'task:read', 'task:update',
          ],
        };

        return rolePermissions[user.role]?.includes(permission) || false;
      },

      hasRole: (...roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
