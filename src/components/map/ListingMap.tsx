"use client";

import dynamic from "next/dynamic";
import { LazyVisible } from "../LazyVisible";

const ListingMapInner = dynamic(() => import("./ListingMapInner"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-sand-deep text-[13px] text-ink/40">
      Chargement de la carte…
    </div>
  );
}

export function ListingMap({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  return (
    <LazyVisible
      // isolate : les panneaux Leaflet (z-index 400+) restent confinés ici
      className="relative isolate z-0 h-[320px] overflow-hidden rounded-2xl"
      placeholder={<MapSkeleton />}
    >
      <ListingMapInner lat={lat} lng={lng} label={label} />
    </LazyVisible>
  );
}
