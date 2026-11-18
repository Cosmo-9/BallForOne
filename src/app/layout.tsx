import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Barlow_Condensed, Plus_Jakarta_Sans } from "next/font/google";
import { logout } from "./actions";
import { isOrganizer } from "@/lib/auth";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "BallForOne · UNILAG Sports",
  description: "Fixtures, live scores and tables for UNILAG inter-faculty and departmental tournaments.",
};

export const viewport: Viewport = {
  themeColor: "#06080F",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const organizer = await isOrganizer();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="relative isolate min-h-screen font-sans antialiased">
        <header className="mx-auto flex max-w-3xl items-center justify-between px-5 pb-3 pt-5">
          <Link href="/" className="flex flex-col">
            <span className="font-display text-[32px] font-extrabold italic leading-none tracking-wide">
              BALL<span className="text-lime">FOR</span>ONE
            </span>
            <span className="text-xs font-medium text-muted">UNILAG Sports</span>
          </Link>
          {organizer ? (
            <form action={logout}>
              <button className="btn-ghost">Sign out</button>
            </form>
          ) : (
            <Link href="/login" aria-label="Rep sign in" className="btn-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            </Link>
          )}
        </header>
        <main className="mx-auto max-w-3xl px-5 pb-16 pt-2">{children}</main>
      </body>
    </html>
  );
}
