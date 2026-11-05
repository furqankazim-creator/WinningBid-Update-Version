import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { brand } from "@/config/brand";
import { themeBootScript } from "@/components/marketing/Theme";
import { I18nProvider } from "@/lib/i18n";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT"] });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-plex-mono", weight: ["400", "500", "600"] });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-plex-sans", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: `${brand.company} — AI-Powered Tender & Bid Intelligence`,
  description: "Analyze tenders, qualify opportunities, manage compliance, build pricing and prepare submission-ready bids from one intelligent workspace — for any industry.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${newsreader.variable} ${plexMono.variable} ${plexSans.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
