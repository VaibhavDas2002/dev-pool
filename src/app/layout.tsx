import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { Toaster } from "@/components/ui/sonner";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Campus Reunion Poll — B.Tech Certificate Collection Planner",
  description: "Coordinate the official date to collect B.Tech graduation certificates after Nov 24, 2026.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <DemoModeBanner />
        <Navbar user={sessionUser} />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

