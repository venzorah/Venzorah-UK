import React from "react";
import { BellIcon, CalendarIcon, LayoutDashboardIcon, PackageIcon, ReceiptIcon, ShoppingCartIcon, TruckIcon, WalletIcon } from "lucide-react";
import { DashboardShell, type ShellNavItem } from "./DashboardShell";
import { useCurrentVendor } from "../../hooks/useCurrentVendor";

export function VendorShell() {
  const { vendor, isServiceVendor } = useCurrentVendor();
  const nav: ShellNavItem[] = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboardIcon, end: true },
  ...(isServiceVendor ?
  [{ to: "/vendor/calendar", label: "Calendar", icon: CalendarIcon }] :
  [
  { to: "/vendor/orders", label: "Orders", icon: ShoppingCartIcon },
  { to: "/vendor/products", label: "Products", icon: PackageIcon },
  { to: "/vendor/shipping", label: "Shipping", icon: TruckIcon }]),

  { to: "/vendor/payouts", label: "Payouts", icon: WalletIcon },
  { to: "/vendor/notifications", label: "Notifications", icon: BellIcon, badge: "notifications" },
  { to: "/vendor/support", label: "Support", icon: ReceiptIcon }];

  return <DashboardShell portal="Vendor" account={vendor?.name} nav={nav} />;
}