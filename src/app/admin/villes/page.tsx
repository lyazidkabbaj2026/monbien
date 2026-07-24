import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { CitiesAdmin } from "@/components/admin/CitiesAdmin";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Villes & quartiers — gestion",
  description: "Espace propriétaire.",
  path: "/admin/villes",
  noindex: true,
});

export default async function AdminCitiesPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="wrap py-8">
      <h1 className="font-display text-2xl font-bold text-ink">
        Villes & quartiers
      </h1>
      <p className="mt-1 mb-6 max-w-2xl text-[13.5px] text-ink/55">
        La couverture géographique du site : chaque ville active alimente la
        carte des prix, l&apos;estimation et les pages SEO ; chaque quartier
        génère ses pages publiques (prix, rapport, comparateur) dès qu&apos;il a
        des prix au m² renseignés dans l&apos;onglet « Prix au m² ».
      </p>
      <CitiesAdmin />
    </div>
  );
}
