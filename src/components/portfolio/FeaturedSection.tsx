import Image from "next/image";
import type { Locale, ProjectSummary } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { isSvg } from "./format";

type FeaturedSectionProps = {
  projects: ProjectSummary[];
  locale: Locale;
  copy: PortfolioCopy;
  onProjectSelect: (project: ProjectSummary) => void;
};

export function FeaturedSection({ projects, locale, copy, onProjectSelect }: FeaturedSectionProps) {
  return (
    <section id="featured" className="px-5 py-24 sm:px-8 md:py-36 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="portfolio-enter grid gap-5 border-b border-zinc-950/20 pb-8 lg:grid-cols-2 lg:items-end">
          <h2 className="text-5xl font-semibold tracking-[-0.04em] text-zinc-950 md:text-7xl">{copy.featured}</h2>
          <p className="max-w-xl text-base leading-7 text-zinc-600 lg:justify-self-end">{copy.featuredIntro}</p>
        </div>

        <div>
          {projects.map((project, index) => (
            <article key={project.name} className="portfolio-enter grid gap-8 border-b border-zinc-950/20 py-12 lg:grid-cols-12 lg:items-center lg:gap-10 lg:py-20">
              <div className={`lg:col-span-5 ${index % 2 ? "lg:col-start-8" : ""}`}>
                <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.18em] text-zinc-500">
                  <span>0{index + 1}</span>
                  <span>{categoryLabels[project.category][locale]}</span>
                </div>
                <h3 className="mt-8 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-zinc-950 md:text-5xl">
                  {project.title[locale]}
                </h3>
                <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-700">{project.summary[locale]}</p>
                <ul className="mt-8 border-t border-zinc-950/15">
                  {project.features[locale].slice(0, 3).map((feature) => (
                    <li key={feature} className="border-b border-zinc-950/15 py-3 text-sm text-zinc-600">{feature}</li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onProjectSelect(project)}
                    className="inline-flex min-h-11 items-center border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    {copy.caseStudy}&nbsp; →
                  </button>
                  <a
                    href={project.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center border border-zinc-950/20 px-5 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  >
                    {copy.liveDemo}&nbsp; ↗
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onProjectSelect(project)}
                aria-label={`${copy.caseStudy}: ${project.title[locale]}`}
                className={`group relative aspect-[16/10] overflow-hidden bg-zinc-950 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] lg:col-span-7 lg:row-start-1 ${index % 2 ? "lg:col-start-1" : "lg:col-start-6"}`}
              >
                <Image
                  src={project.previewPath}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover opacity-95 transition duration-500 ease-out group-hover:scale-[1.015] group-hover:opacity-100"
                  unoptimized={isSvg(project.previewPath)}
                />
                <span className="absolute bottom-4 right-4 bg-[var(--background)] px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-zinc-950">
                  {locale === "zh" ? "可開啟 Demo" : "Live demo available"}
                </span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
