"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { PricePoint } from "./PriceMap";

const nf = new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 });

/** Couleur du marqueur selon la position du prix dans l'échelle de la ville. */
function colorFor(value: number | null, min: number, max: number): string {
  if (value == null) return "#94a3b8";
  const t = max > min ? (value - min) / (max - min) : 0.5;
  // teal (abordable) -> terracotta (premium)
  if (t < 0.33) return "#0F4C5C";
  if (t < 0.66) return "#b8860b";
  return "#E36414";
}

export default function PriceMapInner({
  center,
  points,
}: {
  center: [number, number];
  points: PricePoint[];
}) {
  const venteValues = points.map((p) => p.vente).filter((v): v is number => v != null);
  const min = Math.min(...venteValues);
  const max = Math.max(...venteValues);

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <CircleMarker
          key={point.slug}
          center={[point.lat, point.lng]}
          radius={16}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: colorFor(point.vente, min, max),
            fillOpacity: 0.85,
          }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            {point.name}
            {point.vente ? ` — ${nf.format(point.vente)} MAD/m²` : ""}
          </Tooltip>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong style={{ fontSize: 15 }}>{point.name}</strong>
              <table style={{ marginTop: 6, fontSize: 13, width: "100%" }}>
                <tbody>
                  <tr>
                    <td style={{ paddingRight: 8, color: "#556" }}>Vente</td>
                    <td style={{ fontWeight: 700 }}>
                      {point.vente ? `${nf.format(point.vente)} MAD/m²` : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingRight: 8, color: "#556" }}>Location</td>
                    <td style={{ fontWeight: 700 }}>
                      {point.location ? `${nf.format(point.location)} MAD/m²/mois` : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <a
                href={point.href}
                style={{ display: "inline-block", marginTop: 8, fontWeight: 700, color: "#0F4C5C" }}
              >
                Voir le quartier →
              </a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
