import type { Locale } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";

type HeroSectionProps = {
  projectsCount: number;
  sinceYear: number;
  locale: Locale;
  copy: PortfolioCopy;
};

export function HeroSection({ projectsCount, sinceYear, locale, copy }: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-zinc-950/15 px-5 pb-20 pt-32 sm:px-8 md:pb-28 lg:px-12 lg:pt-40">
      <div className="mx-auto max-w-7xl">
        <p className="portfolio-enter font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          {copy.eyebrow}
        </p>

        <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.45fr)] lg:items-end">
          <h1 className="portfolio-enter max-w-5xl text-[clamp(2.75rem,5.8vw,6rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-zinc-950">
            {copy.headline}<br />
            <span className="text-[var(--accent)]">{copy.headlineAccent}</span>
          </h1>

          <div className="portfolio-enter border-t border-zinc-950/20 pt-6">
            <p className="text-base leading-7 text-zinc-700">{copy.intro}</p>
            <div className="mt-8 flex flex-col gap-3">
              <a
                href="#featured"
                className="flex min-h-11 items-center justify-between bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
              >
                {copy.primaryAction}<span aria-hidden="true">↓</span>
              </a>
              <a
                href="https://github.com/michaelbothsieh-crypto"
                target="_blank"
                rel="noreferrer"
                className="flex min-h-11 items-center justify-between border border-zinc-950/20 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {copy.secondaryAction}<span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <dl className="portfolio-enter mt-16 grid border-y border-zinc-950/15 sm:grid-cols-3 lg:mt-24">
          <div className="border-b border-zinc-950/15 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">Products</dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-950">{projectsCount}</dd>
          </div>
          <div className="border-b border-zinc-950/15 py-5 sm:border-b-0 sm:border-r sm:px-5">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">Shipping since</dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-950">{sinceYear}</dd>
          </div>
          <div className="py-5 sm:pl-5">
            <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">Focus</dt>
            <dd className="mt-1 text-2xl font-semibold text-zinc-950">{locale === "zh" ? "產品系統" : "Product systems"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
