import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { Toaster } from "@/components/ui/sonner";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Campus Reunion Poll — B.Tech Certificate Collection Planner",
  description: "Coordinate the official date to collect B.Tech graduation certificates after Nov 24, 2026.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Campus Reunion",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4F46E5",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white bg-slate-50 text-slate-900">
        <DemoModeBanner />
        <Navbar user={sessionUser} />
        {/* Main content wrapper with mobile tab bar padding */}
        <main className={`flex-1 ${sessionUser ? "pb-24 md:pb-0" : ""}`}>
          {children}
        </main>
        {/* Hide web footer on mobile when bottom app bar is active */}
        <div className={sessionUser ? "hidden md:block" : ""}>
          <Footer />
        </div>
        <MobileBottomNav user={sessionUser} />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
