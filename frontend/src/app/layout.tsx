import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARES Ground Operations Hub",
  description: "Planetary exploration mission control and telemetry console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex text-slate-100 bg-[#0A0F1C] overflow-hidden font-sans">
        <div className="flex h-screen w-screen overflow-hidden">
          {/* Sidebar Left */}
          <Sidebar />

          {/* Core App Interface */}
          <div className="flex flex-col flex-1 h-full min-w-0">
            {/* Topbar Header */}
            <Topbar />

            {/* Viewport content */}
            <main className="flex-1 overflow-y-auto bg-[#0A0F1C] p-6 relative">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
