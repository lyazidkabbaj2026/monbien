import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/admin/LogoutButton";

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
    <div>
      {user && (
        <div className="border-b border-line bg-white/70">
          <div className="wrap flex items-center justify-between gap-4 py-3">
            <nav
              aria-label="Navigation admin"
              className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {[
                { href: "/admin", label: "Leads" },
                { href: "/admin/annonces", label: "Annonces" },
                { href: "/admin/prix", label: "Prix au m²" },
                { href: "/admin/blog", label: "Blog" },
                { href: "/admin/stats", label: "Statistiques" },
              ].map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="shrink-0 rounded-lg px-3.5 py-2 text-[13.5px] font-semibold text-ink/65 transition hover:bg-primary-soft hover:text-primary"
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
            <LogoutButton />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
