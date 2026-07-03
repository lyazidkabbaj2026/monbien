import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Fil d'Ariane" className="overflow-x-auto">
        <ol className="flex items-center gap-1.5 text-[13px] whitespace-nowrap text-ink/55">
          {items.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {i < items.length - 1 ? (
                <Link href={item.path} className="transition hover:text-primary">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink/80">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
