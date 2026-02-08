import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">CRM Pro</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your leads and customers efficiently
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
