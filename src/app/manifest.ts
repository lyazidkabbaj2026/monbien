import type { MetadataRoute } from "next";
import { site } from "../../site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.brandName} — ${site.tagline}`,
    short_name: site.brandName,
    description: `Estimation gratuite, annonces vérifiées et prix au m² par quartier à ${site.defaultCity}.`,
    start_url: "/",
    display: "standalone",
    background_color: site.colors.sand,
    theme_color: site.colors.primary,
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}
