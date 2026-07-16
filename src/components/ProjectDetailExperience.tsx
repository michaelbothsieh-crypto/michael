"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Locale, PillarKey, Project } from "@/lib/projects";
import { categoryLabels, pillarKeys } from "@/lib/projects";
import { copy, type PortfolioCopy } from "./portfolio/copy";
import { formatDate, isSvg } from "./portfolio/format";

const emptySubscribe = () => () => {};
const pillarLabels = {
  observability: "pillarObservability",
  caching: "pillarCaching",
  security: "pillarSecurity",
  reproducibility: "pillarReproducibility",
} as const satisfies Record<PillarKey, keyof PortfolioCopy>;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-teal-700">{children}</h2>;
}

export function ProjectDetailExperience({ project }: { project: Project }) {
  const detectedLocale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => (navigator.language.startsWith("zh") ? "zh" : "en"),
    () => "en"
  );
  const [localeOverride, setLocaleOverride] = useState<Locale | null>(null);
  const locale = localeOverride ?? detectedLocale;
  const t = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale]);

  return (
    <main className="min-h-screen bg-[#f1efe7] text-zinc-950">
      <header className="border-b border-zinc-950/10 bg-[#f1efe7]/95 px-5 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/#projects" className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-700 hover:text-zinc-950">
            ← {t.backToPortfolio}
          </Link>
          <button
            type="button"
            onClick={() => setLocaleOverride(locale === "zh" ? "en" : "zh")}
            aria-label="Switch language"
            className="border border-zinc-950/15 px-3 py-1.5 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5d6f4f]"
          >
            {t.localeToggle}
          </button>
        </div>
      </header>

      <article className="mx-auto max-w-6xl px-5 py-10 sm:px-8 md:py-16">
        <div className="overflow-hidden border border-zinc-950/10 bg-white shadow-sm">
          <div className="relative aspect-[16/8] bg-zinc-100">
            <Image
              src={project.previewPath}
              alt={`${project.title[locale]} preview`}
              fill
              sizes="(min-width: 1200px) 1152px, 100vw"
              className="object-cover"
              unoptimized={isSvg(project.previewPath)}
              fetchPriority="high"
            />
          </div>

          <div className="grid gap-10 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-teal-700">{categoryLabels[project.category][locale]}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">{project.title[locale]}</h1>
              <p className="mt-5 text-lg leading-8 text-zinc-700">{project.summary[locale]}</p>

              {[
                { label: t.problem, text: project.problem[locale] },
                { label: t.challenge, text: project.challenge?.[locale] },
                { label: t.impact, text: project.impact?.[locale] },
              ].map(({ label, text }) => text ? (
                <section key={label} className="mt-8">
                  <SectionHeading>{label}</SectionHeading>
                  <p className="mt-3 leading-7 text-zinc-700">{text}</p>
                </section>
              ) : null)}

              {project.engineeringPillars ? (
                <section className="mt-8">
                  <SectionHeading>{t.engineeringPillars}</SectionHeading>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {pillarKeys.map((key) => {
                      const pillar = project.engineeringPillars?.[key];
                      return pillar ? (
                        <div key={key} className="border border-zinc-950/10 bg-zinc-50 p-4">
                          <h3 className="font-mono text-xs font-semibold">{t[pillarLabels[key]]}</h3>
                          <p className="mt-2 text-xs leading-5 text-zinc-700">{pillar[locale]}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </section>
              ) : null}

              {project.workflow ? (
                <section className="mt-8">
                  <SectionHeading>{t.workflow}</SectionHeading>
                  <p className="mt-3 leading-7 text-zinc-700">{project.workflow[locale]}</p>
                </section>
              ) : null}

              {project.commands ? (
                <section className="mt-8">
                  <SectionHeading>{t.commandOutputs}</SectionHeading>
                  <ul className="mt-3 grid gap-2">
                    {project.commands[locale].map((command) => (
                      <li key={command} className="border border-zinc-950/10 bg-zinc-50 px-4 py-3 font-mono text-xs leading-5 text-zinc-700">{command}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <ul className="mt-8 grid gap-3">
                {project.features[locale].map((feature) => (
                  <li key={feature} className="border border-zinc-950/10 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">{feature}</li>
                ))}
              </ul>
            </div>

            <aside className="space-y-6">
              <div className="grid grid-cols-2 gap-4 border border-zinc-950/10 bg-zinc-50 p-4">
                {[
                  { label: t.created, value: formatDate(project.createdAt, locale) },
                  { label: t.updated, value: formatDate(project.updatedAt, locale) },
                  { label: t.stack, value: project.primaryLanguage ?? "Mixed" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-800">{value}</p>
                  </div>
                ))}
              </div>

              {project.gallery.length > 1 ? (
                <section>
                  <SectionHeading>{t.evidence}</SectionHeading>
                  <div className="mt-3 grid gap-3">
                    {project.gallery.map((image) => (
                      <Image key={image} src={image} alt={`${project.title[locale]} output`} width={900} height={900} className="h-auto w-full border border-zinc-950/10 object-cover" unoptimized={isSvg(image)} />
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {project.homepageUrl ? (
                  <a href={project.homepageUrl} target="_blank" rel="noreferrer" className="bg-zinc-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">{t.openDemo}</a>
                ) : null}
                {project.publicSourceUrl ? (
                  <a href={project.publicSourceUrl} target="_blank" rel="noreferrer" className="border border-zinc-950/15 px-5 py-3 text-sm font-semibold hover:bg-zinc-50">{t.openSource}</a>
                ) : (
                  <p className="text-sm leading-6 text-zinc-600">{t.noSource}</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>
    </main>
  );
}
