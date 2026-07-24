"use client";

import { usePathname } from "next/navigation";

/**
 * Habillage public (header, footer…) masqué dans l'espace admin,
 * qui possède son propre shell (voir src/app/admin/layout.tsx).
 */
export function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
