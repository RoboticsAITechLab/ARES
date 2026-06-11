import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import ConnectionStatusBar from "@/components/ConnectionStatusBar";
import { WebSocketProvider } from "@/providers/WebSocketProvider";


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
  description: "Planetary exploration mission control and telemetry platform",
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
      <body className="min-h-full flex text-slate-100 bg-[#050811] overflow-hidden font-sans">
        <WebSocketProvider>
          <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar Left */}
            <Sidebar />

            {/* Core App Interface */}
            <div className="flex flex-col flex-1 h-full min-w-0">
              {/* Topbar Header */}
              <Topbar />

              {/* Connection Status Indicator */}
              <ConnectionStatusBar />

              {/* Viewport content */}
              <main className="flex-1 overflow-y-auto bg-[#050811] p-4 md:p-6 relative">
                {children}
              </main>
            </div>
          </div>
        </WebSocketProvider>
      </body>
    </html>
  );
}


