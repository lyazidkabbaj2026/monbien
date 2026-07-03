import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { getCities } from "@/lib/data";
import { PriceAdmin } from "@/components/admin/PriceAdmin";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Prix au m² — édition",
  description: "Espace propriétaire.",
  path: "/admin/prix",
  noindex: true,
});

export default async function AdminPricePage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const cities = await getCities();

  return (
    <div className="wrap py-8">
      <h1 className="font-display text-2xl font-bold text-ink">Prix au m²</h1>
      <p className="mt-1 mb-6 max-w-2xl text-[13.5px] text-ink/55">
        Ces valeurs alimentent l&apos;outil d&apos;estimation, la carte des prix et
        les pages quartiers. Les pages publiques sont revalidées automatiquement à
        chaque enregistrement.
      </p>
      <PriceAdmin cities={cities} />
    </div>
  );
}
