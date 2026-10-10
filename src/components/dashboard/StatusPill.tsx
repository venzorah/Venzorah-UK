import React from "react";

const tones = {
  green: "bg-green-50 text-success",
  gold: "bg-gold-50 text-navy",
  navy: "bg-navy-50 text-navy",
  red: "bg-red-50 text-danger",
  grey: "bg-surface text-muted"
} as const;

export function StatusPill({ tone, children }: {tone: keyof typeof tones;children: React.ReactNode;}) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>;
}