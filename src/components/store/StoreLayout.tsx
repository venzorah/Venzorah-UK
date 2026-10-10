import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { StoreHeader } from "./StoreHeader";
import { BottomNav } from "./BottomNav";
import { StoreFooter } from "./StoreFooter";
import { InstallPrompt } from "./InstallPrompt";
import { RouteErrorBoundary } from "../RouteErrorBoundary";

export function StoreLayout() {
  const location = useLocation();
  const { pathname } = location;
  const isLanding = pathname === "/";
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col">
      <StoreHeader />
      <main className="flex-1 pb-20 md:pb-0">
        {/* Keyed by path: each page mounts fresh, so state from the previous page never lingers. */}
        <RouteErrorBoundary key={pathname} resetKey={location.key}>
          <Outlet />
        </RouteErrorBoundary>
      </main>
      {!isLanding && <StoreFooter />}
      <InstallPrompt />
      <BottomNav />
    </div>);

}