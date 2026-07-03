"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await supabaseBrowser().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink/60 transition hover:text-ink"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Déconnexion
    </button>
  );
}
