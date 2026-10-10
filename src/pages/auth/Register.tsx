import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEngagement } from "../../contexts/EngagementContext";
import { AuthCard, Field } from "../../components/auth/AuthCard";

export function Register() {
  const { register } = useAuth();
  const { notify } = useEngagement();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false, marketing: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (form.password.length < 8) next.password = "Use at least 8 characters";
    if (!form.terms) next.terms = "You need to accept the terms to continue";
    setErrors(next);
    if (Object.keys(next).length) return;
    const r = register({ name: form.name, email: form.email, password: form.password, marketingConsent: form.marketing });
    if (!r.ok) return setErrors({ email: r.error });
    notify(r.user.id, "Verify your email", `We've sent a verification link to ${r.user.email}.`);
    navigate(params.get("next") ?? "/account", { replace: true });
  };

  return (
    <AuthCard title="Create your account" subtitle="Shop groceries and book local services.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" autoComplete="name" value={form.name} error={errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Field label="Email" type="email" autoComplete="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Field label="Password" type="password" autoComplete="new-password" value={form.password} error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-0.5 h-4 w-4 accent-navy" />
          <span>I agree to the <Link to="/help/terms" className="underline text-navy">terms</Link> and have read the <Link to="/help/privacy" className="underline text-navy">privacy policy</Link>.</span>
        </label>
        {errors.terms && <p className="text-xs text-danger -mt-2">{errors.terms}</p>}
        <label className="flex items-start gap-2 text-sm text-muted">
          <input type="checkbox" checked={form.marketing} onChange={(e) => setForm({ ...form, marketing: e.target.checked })} className="mt-0.5 h-4 w-4 accent-navy" />
          <span>Email me offers and new arrivals (optional, unsubscribe any time).</span>
        </label>
        <button className="w-full h-12 rounded-xl bg-gold text-navy font-bold">Create account</button>
      </form>
      <p className="mt-5 text-sm text-center text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-navy underline">Sign in</Link>
      </p>
    </AuthCard>);

}