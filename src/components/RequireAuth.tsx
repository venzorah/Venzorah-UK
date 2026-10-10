import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ShieldAlertIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import type { Role } from "../data/users";

interface RequireAuthProps {
  roles?: Role[];
  children: React.ReactNode;
}

export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4 bg-surface">
        <div className="text-center max-w-sm">
          <ShieldAlertIcon className="mx-auto h-10 w-10 text-navy" />
          <h1 className="mt-3 text-xl font-extrabold text-navy">You don't have access to this area</h1>
          <p className="mt-1 text-sm text-muted">Signed in as {user.email}. Sign in with a {roles.join(" or ")} account to continue.</p>
          <Link to="/" className="mt-5 inline-flex h-11 px-5 items-center rounded-xl bg-navy text-white font-semibold">Back to marketplace</Link>
        </div>
      </div>);

  }
  return <>{children}</>;
}