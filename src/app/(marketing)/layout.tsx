import type { Metadata } from "next";
import { Chivo, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/features/navbar";
import { Footer } from "@/components/features/footer";

const chivo = Chivo({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-chivo",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | International Western Bank",
    default: "International Western Bank",
  },
  description: "Secure global banking at your fingertips — send money, manage accounts, track transactions.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${chivo.variable} ${dmSans.variable} flex min-h-screen flex-col`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
