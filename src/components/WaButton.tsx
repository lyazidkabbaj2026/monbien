"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/gtag";

/** Lien WhatsApp avec événement GA4 au clic. */
export function WaButton({
  href,
  placement,
  className = "btn-whatsapp w-full",
  children,
}: {
  href: string;
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      onClick={() => track("whatsapp_click", { placement })}
      className={className}
    >
      {children}
    </a>
  );
}
