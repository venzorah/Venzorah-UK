import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../Logo";

export function AuthCard({ title, subtitle, children }: {title: string;subtitle: string;children: React.ReactNode;}) {
  return (
    <div className="min-h-screen w-full bg-surface flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" aria-label="VenZorah home"><Logo className="h-12 w-auto" /></Link>
      <div className="mt-6 w-full max-w-md bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-card">
        <h1 className="text-2xl font-extrabold text-navy">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>);

}

export function Field({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & {label: string;error?: string;}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <input {...props} aria-invalid={!!error} className={`mt-1 w-full h-11 rounded-xl border px-3 text-sm ${error ? "border-danger" : "border-line"} ${props.className ?? ""}`} />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>);

}