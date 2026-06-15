import type { Locale } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";

type PortfolioNavProps = {
  locale: Locale;
  copy: PortfolioCopy;
  onToggleLocale: () => void;
};

export function PortfolioNav({ locale, copy, onToggleLocale }: PortfolioNavProps) {
  return (
    <nav className="fixed left-1/2 top-4 z-40 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
      <a href="#top" className="font-mono text-xs uppercase tracking-[0.24em] text-white">
        Michael
      </a>
      <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
        <a href="#featured" className="hover:text-white">
          {copy.nav[0]}
        </a>
        <a href="#categories" className="hover:text-white">
          {copy.nav[1]}
        </a>
        <a href="#projects" className="hover:text-white">
          {copy.nav[2]}
        </a>
      </div>
      <button
        type="button"
        className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-xs text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        onClick={onToggleLocale}
        aria-label="Switch language"
      >
        {locale === "zh" ? "EN" : "繁中"}
      </button>
    </nav>
  );
}
