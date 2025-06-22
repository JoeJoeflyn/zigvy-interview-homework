import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { getAccessToken } from '@/lib/cookies';

interface PrivateRouteProps {
  children?: ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = Boolean(getAccessToken());
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  // If children are provided, render them; otherwise, render nested routes
  return children ? <>{children}</> : <Outlet />;
}
