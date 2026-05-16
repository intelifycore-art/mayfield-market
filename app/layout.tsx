import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { SOCIETY } from "@/lib/society";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${SOCIETY.appName} — ${SOCIETY.name} ${SOCIETY.block}`,
  description: `The neighborhood marketplace for ${SOCIETY.name} ${SOCIETY.block}, ${SOCIETY.location}. Fresh produce, daily essentials, and trusted services — from your society's own vendors.`,
  applicationName: SOCIETY.appName,
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
