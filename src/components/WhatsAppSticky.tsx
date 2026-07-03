"use client";

import { usePathname } from "next/navigation";
import { waLink, waMessages } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { site } from "../../site.config";

/** Messages contextuels par section du site. */
function messageFor(pathname: string): string {
  if (pathname.startsWith("/estimer-mon-bien")) return waMessages.valuation;
  if (pathname.startsWith("/simulateur-credit")) return waMessages.simulator;
  if (pathname.startsWith("/prix-immobilier"))
    return waMessages.priceMap(site.defaultCity);
  if (pathname.startsWith("/annonces/"))
    return `Bonjour ${site.brandName}, je vous contacte au sujet d'une annonce vue sur votre site (${pathname}).`;
  return waMessages.generic;
}

export function WhatsAppSticky() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={waLink(messageFor(pathname))}
      target="_blank"
      rel="noopener"
      aria-label="Nous écrire sur WhatsApp"
      className="fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.65)] transition hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
