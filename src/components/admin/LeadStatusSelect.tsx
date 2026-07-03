"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { LeadStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "contacted", label: "Contacté" },
  { value: "won", label: "Gagné" },
  { value: "lost", label: "Perdu" },
];

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-accent/10 text-accent-deep border-accent/40",
  contacted: "bg-primary/10 text-primary border-primary/40",
  won: "bg-green-600/10 text-green-700 border-green-600/40",
  lost: "bg-ink/5 text-ink/50 border-ink/20",
};

export function LeadStatusSelect({
  leadId,
  initialStatus,
}: {
  leadId: string;
  initialStatus: LeadStatus;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [saving, setSaving] = useState(false);

  async function update(next: LeadStatus) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    const { error } = await supabaseBrowser()
      .from("leads")
      .update({ status: next })
      .eq("id", leadId);
    if (error) setStatus(previous);
    setSaving(false);
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => update(e.target.value as LeadStatus)}
      aria-label="Statut du lead"
      className={`rounded-lg border px-2.5 py-1.5 text-[12.5px] font-bold transition ${STATUS_STYLES[status]} ${saving ? "opacity-50" : ""}`}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
