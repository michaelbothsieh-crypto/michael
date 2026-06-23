import type { Locale } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";

type PortfolioNavProps = {
  locale: Locale;
  copy: PortfolioCopy;
  stats: { pv: number; active: number } | null;
  onToggleLocale: () => void;
};

export function PortfolioNav({ locale, copy, stats, onToggleLocale }: PortfolioNavProps) {
  return (
    <nav className="gsap-nav fixed inset-x-0 top-0 z-40 border-b border-zinc-950/10 bg-[#f1efe7]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
      <a href="#top" className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-950">
        Michael
      </a>
      <div className="hidden items-center gap-6 text-sm text-zinc-600 md:flex">
        <a href="#featured" className="hover:text-zinc-950">
          {copy.nav[0]}
        </a>
        <a href="#categories" className="hover:text-zinc-950">
          {copy.nav[1]}
        </a>
        <a href="#projects" className="hover:text-zinc-950">
          {copy.nav[2]}
        </a>
      </div>
      <div className="flex items-center gap-4">
        {stats && (
          <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500">
            <span className="hidden sm:inline">
              {copy.statsPv}: {stats.pv.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5 border-l border-zinc-950/10 pl-3 sm:border-l sm:pl-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#5d6f4f]"></span>
              </span>
              <span>
                {stats.active.toLocaleString()} {locale === "zh" ? "在線" : "Online"}
              </span>
            </span>
          </div>
        )}
        <button
          type="button"
          className="border border-zinc-950/15 px-3 py-1.5 font-mono text-xs text-zinc-950 transition hover:bg-[#1f211b] hover:text-[#f7f4ea] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5d6f4f]"
          onClick={onToggleLocale}
          aria-label="Switch language"
        >
          {locale === "zh" ? "EN" : "繁中"}
        </button>
      </div>
      </div>
    </nav>
  );
}
