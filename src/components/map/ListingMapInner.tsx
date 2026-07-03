"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ListingMapInner({
  lat,
  lng,
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker
        center={[lat, lng]}
        radius={14}
        pathOptions={{ color: "#0F4C5C", fillColor: "#E36414", fillOpacity: 0.85, weight: 3 }}
      >
        <Tooltip permanent direction="top" offset={[0, -12]}>
          {label}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
