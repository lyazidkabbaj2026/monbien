import { ImageResponse } from "next/og";
import { site } from "../../site.config";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icône iOS/Android générée — même marque que /icon.svg.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: site.colors.primary,
          borderRadius: 36,
        }}
      >
        <svg width="124" height="124" viewBox="0 0 32 32">
          <path d="M16 7.2 L25.4 15.6 H22.6 V24.4 H9.4 V15.6 H6.6 Z" fill={site.colors.sand} />
          <circle cx="16" cy="19" r="2.4" fill={site.colors.accent} />
        </svg>
      </div>
    ),
    size
  );
}
