import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { useEngagement } from "../../contexts/EngagementContext";

export function SettingsTab() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { openTicket, notify } = useEngagement();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name ?? "", phone: user?.phone ?? "", marketingConsent: user?.marketingConsent ?? false });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [pwError, setPwError] = useState<string | null>(null);

  if (!user) return null;

  const requestPrivacy = (kind: "export" | "deletion") => {
    const ticket = openTicket({
      userId: user.id,
      userName: user.name,
      subject: kind === "export" ? "Data export request" : "Account deletion request",
      category: "Privacy request",
      body: kind === "export" ? "Please send me a copy of my personal data." : "Please delete my account and personal data, keeping only records required by law."
    });
    notify("admin", `Privacy request ${ticket.id}`, `${user.email}: ${ticket.subject}`, "/admin/support");
    toast.success(`Request ${ticket.id} received. We'll confirm by email within one month.`);
  };

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <form
        className="bg-white rounded-2xl border border-line p-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (profile.name.trim().length < 2) return toast.error("Enter your name");
          updateProfile(profile);
          toast.success("Profile updated");
        }}>
        
        <h2 className="font-bold text-navy">Profile</h2>
        <label className="block"><span className="text-xs font-semibold text-muted">Name</span><input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
        <label className="block"><span className="text-xs font-semibold text-muted">Email</span><input value={user.email} disabled className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm bg-surface text-muted" /></label>
        <label className="block"><span className="text-xs font-semibold text-muted">Mobile</span><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={profile.marketingConsent} onChange={(e) => setProfile({ ...profile, marketingConsent: e.target.checked })} className="h-4 w-4 accent-navy" />Send me marketing emails</label>
        <button className="h-10 px-4 rounded-lg bg-navy text-white text-sm font-semibold">Save profile</button>
      </form>

      <div className="space-y-6">
        <form
          className="bg-white rounded-2xl border border-line p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const r = changePassword(pw.current, pw.next);
            if (!r.ok) return setPwError(r.error ?? "Couldn't change password");
            setPwError(null);
            setPw({ current: "", next: "" });
            toast.success("Password changed");
          }}>
          
          <h2 className="font-bold text-navy">Password</h2>
          <label className="block"><span className="text-xs font-semibold text-muted">Current password</span><input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
          <label className="block"><span className="text-xs font-semibold text-muted">New password</span><input type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-line px-3 text-sm" /></label>
          {pwError && <p role="alert" className="text-sm text-danger">{pwError}</p>}
          <button className="h-10 px-4 rounded-lg border border-line text-sm font-semibold text-navy">Change password</button>
        </form>

        <section className="bg-white rounded-2xl border border-line p-5">
          <h2 className="font-bold text-navy">Your data</h2>
          <p className="mt-1 text-sm text-muted">See <Link to="/help/privacy" className="underline">privacy policy</Link> and <Link to="/help/account-deletion" className="underline">what deletion removes</Link>.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => requestPrivacy("export")} className="h-10 px-4 rounded-lg border border-line text-sm font-semibold text-navy">Request my data</button>
            <button onClick={() => window.confirm("Request permanent deletion of your account?") && requestPrivacy("deletion")} className="h-10 px-4 rounded-lg border border-line text-sm font-semibold text-danger">Delete account</button>
          </div>
        </section>

        <button onClick={() => {logout();navigate("/");}} className="h-10 px-4 rounded-lg text-sm font-semibold text-muted underline">Sign out</button>
      </div>
    </div>);

}