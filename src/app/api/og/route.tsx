import { ImageResponse } from "next/og";
import { site } from "../../../../site.config";

export const revalidate = 86400;

/**
 * Cartes Open Graph générées : /api/og?title=…&subtitle=…&badge=…
 * Utilisées par les pages sans photo (outils, pages programmatiques, quartiers).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || site.tagline).slice(0, 90);
  const subtitle = (searchParams.get("subtitle") || "").slice(0, 130);
  const badge = (searchParams.get("badge") || "").slice(0, 42);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#ffffff",
          backgroundColor: site.colors.primary,
          backgroundImage: `radial-gradient(900px 500px at 90% -10%, ${site.colors.accent}55, transparent 60%), linear-gradient(160deg, #0b3947, ${site.colors.primary})`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
            {site.brandName}
            <span style={{ color: site.colors.accent }}>.</span>
          </div>
          {badge && (
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 700,
                padding: "10px 26px",
                borderRadius: 999,
                backgroundColor: `${site.colors.accent}`,
                color: "#ffffff",
              }}
            >
              {badge}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 55 ? 56 : 66,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.35,
                color: "#ffffffcc",
                maxWidth: 950,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "#ffffffb3",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: site.colors.accent,
            }}
          />
          Estimation gratuite · Prix au m² par quartier · {site.defaultCity}, Maroc
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
