import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Lead, LeadSource } from "@/lib/types";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Statistiques leads",
  description: "Espace propriétaire.",
  path: "/admin/stats",
  noindex: true,
});

const SOURCE_LABELS: Record<LeadSource, string> = {
  valuation: "Estimation",
  simulator: "Simulateur",
  price_map: "Carte prix",
  listing: "Annonce",
  contact: "Contact",
  blog: "Blog",
};

const WEEKS_SHOWN = 8;
const DAY_MS = 86_400_000;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setHours(0, 0, 0, 0);
  d.setTime(d.getTime() - day * DAY_MS);
  return d;
}

function Bar({ value, max, label, sub }: { value: number; max: number; label: string; sub?: string }) {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 2;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-[13px] font-semibold text-ink/70">
        {label}
      </span>
      <div className="h-6 flex-1 overflow-hidden rounded-md bg-sand-deep/60">
        <div
          className="flex h-full items-center rounded-md bg-primary pl-2 text-[11.5px] font-bold text-white"
          style={{ width: `${width}%` }}
        >
          {value > 0 ? value : ""}
        </div>
      </div>
      {sub && <span className="w-14 shrink-0 text-right text-[12px] text-ink/50">{sub}</span>}
    </div>
  );
}

export default async function AdminStatsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const since = new Date(Date.now() - 90 * DAY_MS).toISOString();
  const { data } = await supabase
    .from("leads")
    .select("source, status, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);
  const leads = (data as Pick<Lead, "source" | "status" | "created_at">[]) ?? [];

  // Par source
  const bySource = new Map<LeadSource, { total: number; won: number }>();
  for (const lead of leads) {
    const entry = bySource.get(lead.source) ?? { total: 0, won: 0 };
    entry.total += 1;
    if (lead.status === "won") entry.won += 1;
    bySource.set(lead.source, entry);
  }
  const sourceRows = [...bySource.entries()].sort((a, b) => b[1].total - a[1].total);
  const maxSource = Math.max(1, ...sourceRows.map(([, v]) => v.total));

  // Par semaine (8 dernières)
  const thisWeek = startOfWeek(new Date());
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const start = new Date(thisWeek.getTime() - (WEEKS_SHOWN - 1 - i) * 7 * DAY_MS);
    return { start, count: 0 };
  });
  for (const lead of leads) {
    const t = startOfWeek(new Date(lead.created_at)).getTime();
    const week = weeks.find((w) => w.start.getTime() === t);
    if (week) week.count += 1;
  }
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));

  // Statuts
  const statusCounts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    won: leads.filter((l) => l.status === "won").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };
  const winRate =
    statusCounts.won + statusCounts.lost > 0
      ? Math.round((statusCounts.won / (statusCounts.won + statusCounts.lost)) * 100)
      : null;

  return (
    <div className="wrap py-8">
      <h1 className="font-display text-2xl font-bold text-ink">Statistiques</h1>
      <p className="mt-1 text-[13.5px] text-ink/55">90 derniers jours</p>

      {/* Totaux */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Leads reçus", value: leads.length },
          { label: "À traiter", value: statusCounts.new },
          { label: "Gagnés", value: statusCounts.won },
          { label: "Taux de gain", value: winRate != null ? `${winRate} %` : "—" },
        ].map((card) => (
          <div key={card.label} className="card px-5 py-4">
            <p className="text-[12.5px] font-semibold tracking-wide text-ink/55 uppercase">
              {card.label}
            </p>
            <p className="font-display mt-1 text-2xl font-bold text-primary">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Par source */}
        <section className="card p-6">
          <h2 className="mb-5 text-[15px] font-bold text-ink">
            Leads par canal{" "}
            <span className="font-normal text-ink/45">(lequel convertit ?)</span>
          </h2>
          {sourceRows.length === 0 ? (
            <p className="text-[13.5px] text-ink/50">Aucun lead sur la période.</p>
          ) : (
            <div className="space-y-3">
              {sourceRows.map(([source, v]) => (
                <Bar
                  key={source}
                  label={SOURCE_LABELS[source]}
                  value={v.total}
                  max={maxSource}
                  sub={v.won > 0 ? `${v.won} gagné${v.won > 1 ? "s" : ""}` : undefined}
                />
              ))}
            </div>
          )}
        </section>

        {/* Par semaine */}
        <section className="card p-6">
          <h2 className="mb-5 text-[15px] font-bold text-ink">
            Volume hebdomadaire{" "}
            <span className="font-normal text-ink/45">({WEEKS_SHOWN} dernières semaines)</span>
          </h2>
          <div className="flex h-40 items-end gap-2">
            {weeks.map((week) => (
              <div key={week.start.toISOString()} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-ink/70">
                  {week.count > 0 ? week.count : ""}
                </span>
                <div
                  className="w-full rounded-t-md bg-accent/85"
                  style={{ height: `${Math.max(3, (week.count / maxWeek) * 100)}%` }}
                />
                <span className="text-[10.5px] text-ink/45">
                  {week.start.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-6 text-[12.5px] text-ink/45">
        Chaque lead porte sa source (estimation, simulateur, carte des prix, annonce,
        contact, blog) : ces chiffres mesurent directement quel outil du site génère
        vos contacts.
      </p>
    </div>
  );
}
