import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "./actions";
import { isOrganizer } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "BallForOne",
  description: "Tournaments, teams and rankings for departmental and inter-faculty ball sports.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const organizer = await isOrganizer();

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="bg-pitch text-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-extrabold tracking-tight">
              Ball<span className="text-green-400">For</span>One
            </Link>
            {organizer ? (
              <form action={logout}>
                <button className="text-sm text-green-200 hover:text-white">Sign out</button>
              </form>
            ) : (
              <Link href="/login" className="text-sm text-green-200 hover:text-white">
                Organizer sign in
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
