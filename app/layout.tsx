import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/Header"; // ✅ import your Header component
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendify",
  description: "Created by Hackedemics",
  generator: "Aryan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* ✅ Header appears on every page */}
        <Header />

        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
