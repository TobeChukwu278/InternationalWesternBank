import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { RouteProgress } from "@/components/ui/route-progress";

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
      <body className="bg-iwb-surface font-sans text-iwb-navy antialiased">
        <RouteProgress />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
