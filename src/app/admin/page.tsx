import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import type { Lead, LeadSource, LeadStatus, Valuation } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Dashboard leads",
  description: "Espace propriétaire.",
  path: "/admin",
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

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  won: "Gagné",
  lost: "Perdu",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; statut?: string }>;
}) {
  const { source, statut } = await searchParams;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  let leadsQuery = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (source) leadsQuery = leadsQuery.eq("source", source);
  if (statut) leadsQuery = leadsQuery.eq("status", statut);

  const [{ data: leadsData }, { data: valuationsData }] = await Promise.all([
    leadsQuery,
    supabase
      .from("valuations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const leads = (leadsData as Lead[]) ?? [];
  const valuations = (valuationsData as Valuation[]) ?? [];
  const valuationByLead = new Map(valuations.map((v) => [v.lead_id, v]));

  const counts = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    valuation: leads.filter((l) => l.source === "valuation").length,
  };

  const filterLink = (params: Record<string, string | undefined>) => {
    const merged = { source, statut, ...params };
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v) as [string, string][]
    ).toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Leads</h1>
          <p className="mt-1 text-[13.5px] text-ink/55">
            {counts.total} affichés · {counts.new} nouveaux · {counts.valuation}{" "}
            estimations
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Link
          href={filterLink({ source: undefined })}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${!source ? "bg-primary text-white" : "border border-line bg-white text-ink/60"}`}
        >
          Toutes sources
        </Link>
        {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((s) => (
          <Link
            key={s}
            href={filterLink({ source: s })}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${source === s ? "bg-primary text-white" : "border border-line bg-white text-ink/60"}`}
          >
            {SOURCE_LABELS[s]}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-line" aria-hidden />
        <Link
          href={filterLink({ statut: undefined })}
          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${!statut ? "bg-accent text-white" : "border border-line bg-white text-ink/60"}`}
        >
          Tous statuts
        </Link>
        {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
          <Link
            key={s}
            href={filterLink({ statut: s })}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ${statut === s ? "bg-accent text-white" : "border border-line bg-white text-ink/60"}`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {/* Tableau */}
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-[13.5px]">
          <thead className="bg-primary-soft text-left text-[12px] tracking-wide text-ink/55 uppercase">
            <tr>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 font-bold">Source</th>
              <th className="px-4 py-3 font-bold">Détails</th>
              <th className="px-4 py-3 font-bold">Statut</th>
              <th className="px-4 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/50">
                  Aucun lead pour ces filtres.
                </td>
              </tr>
            )}
            {leads.map((lead) => {
              const valuation = valuationByLead.get(lead.id);
              return (
                <tr key={lead.id} className="border-t border-line/70 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-ink/60">
                    {formatDateTime(lead.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-ink">{lead.name}</p>
                    <p className="text-ink/60">{lead.phone}</p>
                    {lead.email && <p className="text-ink/50">{lead.email}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[12px] font-bold text-primary">
                      {SOURCE_LABELS[lead.source]}
                    </span>
                    {lead.source_ref && (
                      <p className="mt-1 text-[12px] text-ink/50">{lead.source_ref}</p>
                    )}
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-ink/70">
                    {valuation ? (
                      <p>
                        {valuation.property_type} · {valuation.area_m2} m² ·{" "}
                        {valuation.condition}
                        <span className="block font-bold text-primary">
                          {formatPrice(valuation.estimated_low)} —{" "}
                          {formatPrice(valuation.estimated_high)}
                        </span>
                      </p>
                    ) : lead.message ? (
                      <p className="line-clamp-3">{lead.message}</p>
                    ) : Object.keys(lead.payload ?? {}).length > 0 ? (
                      <details>
                        <summary className="cursor-pointer text-[12.5px] font-semibold text-primary">
                          Voir le détail
                        </summary>
                        <pre className="mt-1 text-[11px] whitespace-pre-wrap text-ink/60">
                          {JSON.stringify(lead.payload, null, 1)}
                        </pre>
                      </details>
                    ) : (
                      <span className="text-ink/35">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusSelect leadId={lead.id} initialStatus={lead.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener"
                      className="font-bold text-whatsapp hover:underline"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${lead.phone}`}
                      className="ml-3 font-bold text-primary hover:underline"
                    >
                      Appeler
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
