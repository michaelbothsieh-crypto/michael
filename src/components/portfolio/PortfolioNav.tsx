"use client";

import { useState } from "react";
import type { PortfolioCopy } from "./copy";

type PortfolioNavProps = {
  copy: PortfolioCopy;
  stats: { pv: number; active: number } | null;
  onToggleLocale: () => void;
};

export function PortfolioNav({ copy, stats, onToggleLocale }: PortfolioNavProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#featured", label: copy.nav.featured },
    { href: "#projects", label: copy.nav.all },
    { href: "https://github.com/michaelbothsieh-crypto", label: copy.nav.github, external: true },
  ];

  return (
    <nav className="portfolio-enter fixed inset-x-0 top-0 z-40 border-b border-zinc-950/10 bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <a href="#top" className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-[0.24em] text-zinc-950">
          Michael
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noreferrer" : undefined} className="inline-flex min-h-11 items-center hover:text-zinc-950 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500">
              <span className="hidden sm:inline">
                {copy.statsPv}: {stats.pv.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 border-l border-zinc-950/10 pl-3">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent)]" />
                </span>
                {stats.active.toLocaleString()} {copy.activeLabel}
              </span>
            </div>
          )}

          <button
            type="button"
            className="min-h-11 border border-zinc-950/15 px-3 py-2 font-mono text-xs text-zinc-950 transition hover:bg-zinc-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            onClick={onToggleLocale}
            aria-label="Switch language"
          >
            {copy.localeToggle}
          </button>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className={`block h-px w-5 bg-zinc-950 transition-all duration-200 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-zinc-950 transition-all duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-zinc-950 transition-all duration-200 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden transition-all duration-200 md:hidden ${open ? "max-h-48 border-t border-zinc-950/10" : "max-h-0"}`}
      >
        <div className="flex flex-col px-5 py-3 sm:px-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
              className="flex min-h-11 items-center py-3 text-sm text-zinc-700 hover:text-zinc-950 border-b border-zinc-950/5 last:border-0"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
