import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const DESCRIPTION =
  "PulseGrid — live planetary risk intelligence fusing NOAA space weather, USGS earthquakes, and NASA wildfires into a deterministic, hash-sealed Instability Index with MCP agent tools.";

export const metadata: Metadata = {
  title: "PulseGrid — Live Planetary Risk Intelligence",
  description: DESCRIPTION,
  keywords: ["space weather", "earthquakes", "USGS", "NOAA", "NASA EONET", "MCP", "AI agents", "risk index", "next.js", "3D globe"],
  authors: [{ name: "aniruddhaadak80" }],
  openGraph: {
    title: "PulseGrid — Live Planetary Risk Intelligence",
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseGrid — Live Planetary Risk Intelligence",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#04060c] flex flex-col">{children}</body>
    </html>
  );
}
