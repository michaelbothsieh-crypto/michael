import type { Locale } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";

type PortfolioNavProps = {
  locale: Locale;
  copy: PortfolioCopy;
  onToggleLocale: () => void;
};

export function PortfolioNav({ locale, copy, onToggleLocale }: PortfolioNavProps) {
  return (
    <nav className="fixed left-1/2 top-4 z-40 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border border-zinc-950/10 bg-white/78 px-4 py-3 shadow-lg shadow-zinc-950/5 backdrop-blur-xl">
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
      <button
        type="button"
        className="rounded-full border border-zinc-950/15 px-3 py-1.5 font-mono text-xs text-zinc-950 transition hover:bg-zinc-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600"
        onClick={onToggleLocale}
        aria-label="Switch language"
      >
        {locale === "zh" ? "EN" : "繁中"}
      </button>
    </nav>
  );
}
