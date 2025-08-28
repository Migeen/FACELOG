import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '@/lib/auth';
import { Layout } from './Layout';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}