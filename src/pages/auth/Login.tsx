import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { demoAccounts } from "../../data/users";
import { AuthCard, Field } from "../../components/auth/AuthCard";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Enter your email and password.");
    setBusy(true);
    setTimeout(() => {
      const r = login(email, password);
      setBusy(false);
      if (!r.ok) return setError(r.error);
      const next = params.get("next");
      navigate(next ?? (r.user.role === "admin" ? "/admin" : r.user.role === "vendor" ? "/vendor" : "/account"), { replace: true });
    }, 300);
  };

  return (
    <AuthCard title="Sign in" subtitle="Welcome back to VenZorah.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        <button disabled={busy} className="w-full h-12 rounded-xl bg-navy text-white font-bold disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-5 text-sm text-center text-muted">
        New here? <Link to={`/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-semibold text-navy underline">Create an account</Link>
      </p>
      <div className="mt-6 pt-5 border-t border-line">
        <p className="text-xs font-semibold text-muted">Demo accounts (password demo1234)</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {demoAccounts.map((a) =>
          <button key={a.email} type="button" onClick={() => {setEmail(a.email);setPassword("demo1234");}} className="h-9 rounded-lg border border-line text-xs font-semibold text-navy hover:border-navy/40">
              {a.label}
            </button>
          )}
        </div>
      </div>
    </AuthCard>);

}