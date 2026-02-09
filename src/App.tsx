// File: Frontend/src/App.tsx
// UPDATED: Added LeadForm and TaskForm imports and routes

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Layouts
import MainLayout from '@components/layout/MainLayout';
import AuthLayout from '@components/layout/AuthLayout';

// Pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import Dashboard from '@pages/dashboard/Dashboard';
import Leads from '@pages/leads/Leads';
import LeadDetail from '@pages/leads/LeadDetail';
import LeadForm from '@pages/leads/LeadForm'; 
import Users from '@pages/users/Users';
import UserDetail from '@pages/users/UserDetail';
import Tasks from '@pages/tasks/Tasks';
import TaskDetail from '@pages/tasks/TaskDetail';
import TaskForm from '@pages/tasks/TaskForm'; 
import Activities from '@pages/activities/Activities';
import Settings from '@pages/settings/Settings';
import NotFound from '@pages/NotFound';

// Components
import ProtectedRoute from '@components/auth/ProtectedRoute';
import RoleRoute from '@components/auth/RoleRoute';

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Leads - NEW ROUTE ADDED */}
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/new" element={<LeadForm />} />
              <Route path="/leads/:id" element={<LeadDetail />} />

              {/* Tasks - NEW ROUTE ADDED */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />

              {/* Activities */}
              <Route path="/activities" element={<Activities />} />

              {/* Admin & Manager Only Routes */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/users" element={<Users />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;