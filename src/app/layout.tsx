import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { RouteProgress } from "@/components/ui/route-progress";
import { SettingsProvider } from "@/components/features/settings-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | International Western Bank",
    default: "International Western Bank",
  },
  description: "Secure global banking at your fingertips — send money, manage accounts, track transactions.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" precedence="default" />
      <body className="bg-iwb-surface font-sans text-iwb-navy antialiased">
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=document.cookie.match(/(^| )theme=([^;]+)/);if(t&&t[2]==='dark')document.documentElement.classList.add('dark')})()`,
        }} />
        <RouteProgress />
        <ToastProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
