"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { NavData } from "@/lib/content";
import { SiteFooter } from "@/components/SiteFooter";

export function AppShell({ nav, children }: { nav: NavData; children: React.ReactNode }) {
  const moreLinks = useMemo(() => {
    const seen = new Set(nav.primary.map((l) => l.href));
    return nav.all.filter((l) => !seen.has(l.href));
  }, [nav.primary, nav.all]);

  return (
    <div className="drawer drawer-end min-h-screen">
      <input id="rhba-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-screen flex-col bg-base-100 text-base-content">
        <header className="navbar sticky top-0 z-40 min-h-14 border-b border-base-300 bg-base-100/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex-1 min-w-0">
            <Link
              href="/"
              className="btn btn-ghost h-auto min-h-0 max-w-full justify-start py-2 text-left text-sm font-semibold tracking-tight sm:text-base md:text-lg"
            >
              <span className="line-clamp-1 sm:hidden">RHBA</span>
              <span className="hidden sm:line-clamp-2 sm:inline">Raleigh Hills Business Association</span>
            </Link>
          </div>
          <nav className="hidden flex-none flex-wrap justify-end gap-1 lg:flex" aria-label="Primary">
            {nav.primary.map((l) => (
              <Link key={l.href} href={l.href} className="btn btn-ghost btn-sm">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex-none lg:hidden">
            <label htmlFor="rhba-drawer" className="btn btn-square btn-ghost" aria-label="Open menu">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-6 w-6 stroke-current"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
        </header>
        <main className="flex-1 py-8">{children}</main>
        <SiteFooter />
      </div>
      <div className="drawer-side z-50">
        <label htmlFor="rhba-drawer" aria-label="Close menu" className="drawer-overlay" />
        <div className="flex min-h-full w-72 max-w-[85vw] flex-col gap-2 bg-base-200 p-4">
          <ul className="menu w-full shrink-0">
            <li className="menu-title text-xs uppercase opacity-60">Menu</li>
            {nav.primary.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
          {moreLinks.length > 0 ? (
            <ul className="menu w-full max-h-[min(55vh,32rem)] flex-1 overflow-y-auto overscroll-contain">
              <li className="menu-title text-xs uppercase opacity-60">More pages</li>
              {moreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="line-clamp-2 h-auto min-h-0 whitespace-normal py-2 text-sm leading-snug">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
