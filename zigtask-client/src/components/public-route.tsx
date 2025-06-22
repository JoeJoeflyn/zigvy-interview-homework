import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { getAccessToken } from "@/lib/cookies";

export function PublicRoute({ children }: { children: ReactNode }) {
  const token = getAccessToken();
  if (token && token.trim()) {
    return <Navigate to="/tasks" replace />;
  }
  return <>{children}</>;
} 