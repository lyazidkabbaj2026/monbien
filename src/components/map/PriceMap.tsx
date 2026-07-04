"use client";

import dynamic from "next/dynamic";
import { LazyVisible } from "../LazyVisible";

export interface PricePoint {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  vente: number | null;
  location: number | null;
  href: string;
}

const PriceMapInner = dynamic(() => import("./PriceMapInner"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-sand-deep text-[13px] text-ink/40">
      Chargement de la carte des prix…
    </div>
  );
}

export function PriceMap({
  center,
  points,
}: {
  center: [number, number];
  points: PricePoint[];
}) {
  return (
    <LazyVisible
      // isolate : les panneaux Leaflet (z-index 400+) restent confinés ici
      className="relative isolate z-0 h-[420px] overflow-hidden rounded-2xl sm:h-[480px]"
      placeholder={<MapSkeleton />}
    >
      <PriceMapInner center={center} points={points} />
    </LazyVisible>
  );
}
