import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { CSSProperties } from "react";
import "./globals.css";
import { site } from "../../site.config";
import { siteUrl, localBusinessJsonLd } from "@/lib/seo";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppSticky } from "@/components/WhatsAppSticky";
import { ValuationNudge } from "@/components/ValuationNudge";
import { JsonLd } from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.brandName} — ${site.tagline}`,
    template: `%s | ${site.brandName}`,
  },
  description: `Agence immobilière à ${site.defaultCity} : estimation gratuite de votre bien, annonces vérifiées, simulateur de crédit et prix au m² par quartier. ${site.agent.responseTime}.`,
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// Injecte la palette de site.config.ts comme variables CSS globales.
const brandVars = {
  "--brand-primary": site.colors.primary,
  "--brand-accent": site.colors.accent,
  "--brand-ink": site.colors.ink,
  "--brand-sand": site.colors.sand,
} as CSSProperties;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html
      lang="fr"
      style={brandVars}
      className={`${inter.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="font-sans flex min-h-full flex-col">
        <JsonLd data={localBusinessJsonLd()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppSticky />
        <ValuationNudge />
        <Analytics />
        <SpeedInsights />
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
