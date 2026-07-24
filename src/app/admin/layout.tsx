import Link from "next/link";
import { site } from "../../../site.config";
import { supabaseServer } from "@/lib/supabase/server";
import { LogoMark } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="wrap flex h-14 items-center justify-between gap-4">
          <Link
            href="/admin"
            aria-label="Tableau de bord admin"
            className="flex shrink-0 items-center gap-2.5 text-ink"
          >
            <LogoMark className="h-7 w-7" />
            <span className="font-display text-[17px] font-bold tracking-tight">
              {site.brandName}
              <span className="ml-1.5 rounded-md bg-primary-soft px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-primary uppercase">
                Admin
              </span>
            </span>
          </Link>
          {user && <AdminNav />}
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
