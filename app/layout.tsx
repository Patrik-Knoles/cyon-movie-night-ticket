import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CYON Movie Night – Ticketing Page",
  description:
    "Join us for an unforgettable Movie Night experience with the Catholic Youth Organization of Nigeria (CYON) at St. Cyprian Catholic Church, Oko-Oba Agege.",
  openGraph: {
    images: [
      {
        url: "/images/design-mode/CYON-Logo.png",
        width: 1200,
        height: 630,
        alt: "CYON Logo",
      },
    ],
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
