import Image from "next/image";
import { useEffect } from "react";
import type { Locale, PillarKey, Project } from "@/lib/projects";
import { categoryLabels, pillarKeys } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { formatDate, isSvg } from "./format";

const pillarLabels = {
  observability: "pillarObservability",
  caching: "pillarCaching",
  security: "pillarSecurity",
  reproducibility: "pillarReproducibility",
} as const satisfies Record<PillarKey, keyof PortfolioCopy>;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="font-mono text-xs uppercase tracking-[0.22em] text-teal-700">{children}</h4>;
}

type ProjectModalProps = {
  project: Project | null;
  views: number;
  locale: Locale;
  copy: PortfolioCopy;
  onClose: () => void;
};

export function ProjectModal({ project, views, locale, copy, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, project]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/55 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      onClick={onClose}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[8px] border border-zinc-950/10 bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="relative aspect-[16/8] overflow-hidden bg-zinc-100">
          <Image
            src={project.previewPath}
            alt={`${project.title[locale]} preview`}
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-90"
            unoptimized={isSvg(project.previewPath)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <button
            type="button"
            autoFocus
            className="absolute right-4 top-4 rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            onClick={onClose}
          >
            {copy.close}
          </button>
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-teal-700">{categoryLabels[project.category][locale]}</p>
            <h3 id="project-title" className="mt-4 text-4xl font-semibold text-zinc-950">
              {project.title[locale]}
            </h3>
            <p className="mt-5 text-lg leading-8 text-zinc-700">{project.summary[locale]}</p>

            {[
              { label: copy.problem, text: project.problem[locale] },
              { label: copy.challenge, text: project.challenge?.[locale] },
              { label: copy.impact, text: project.impact?.[locale] },
            ].map(({ label, text }) =>
              text ? (
                <section key={label} className="mt-8">
                  <SectionHeading>{label}</SectionHeading>
                  <p className="mt-3 text-base leading-7 text-zinc-700">{text}</p>
                </section>
              ) : null
            )}

            {project.engineeringPillars ? (
              <section className="mt-8">
                <SectionHeading>{copy.engineeringPillars}</SectionHeading>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {pillarKeys.map((key) => {
                    const pillar = project.engineeringPillars?.[key];
                    if (!pillar) return null;
                    return (
                      <div key={key} className="rounded-[8px] border border-zinc-950/10 bg-zinc-50/50 p-4">
                        <h5 className="font-mono text-xs font-semibold text-zinc-950 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                          {copy[pillarLabels[key]]}
                        </h5>
                        <p className="mt-2 text-xs leading-5 text-zinc-700">{pillar[locale]}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {project.workflow ? (
              <section className="mt-8">
                <SectionHeading>{copy.workflow}</SectionHeading>
                <p className="mt-3 text-base leading-7 text-zinc-700">{project.workflow[locale]}</p>
              </section>
            ) : null}

            {project.commands ? (
              <section className="mt-8">
                <SectionHeading>{copy.commandOutputs}</SectionHeading>
                <ul className="mt-3 grid gap-2">
                  {project.commands[locale].map((command) => (
                    <li key={command} className="rounded-[8px] border border-zinc-950/10 bg-zinc-50 px-4 py-3 font-mono text-xs leading-5 text-zinc-700">
                      {command}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ul className="mt-6 grid gap-3">
              {project.features[locale].map((feature) => (
                <li key={feature} className="rounded-[8px] border border-zinc-950/10 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm shadow-zinc-950/5">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-[8px] border border-zinc-950/10 bg-zinc-50 p-4">
              {[
                { label: copy.created, value: formatDate(project.createdAt, locale) },
                { label: copy.updated, value: formatDate(project.updatedAt, locale) },
                { label: copy.stack, value: project.primaryLanguage ?? "Mixed" },
                { label: copy.views, value: views.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
                  <p className="mt-1 font-mono text-xs text-zinc-800">{value}</p>
                </div>
              ))}
            </div>
            {project.gallery.length > 1 ? (
              <div>
                <SectionHeading>{copy.evidence}</SectionHeading>
                <div className="mt-3 grid gap-3">
                  {project.gallery.map((image) => (
                    <div key={image} className="overflow-hidden rounded-[8px] border border-zinc-950/10 bg-zinc-100">
                      <Image src={image} alt={`${project.title[locale]} output`} width={900} height={900} className="h-auto w-full object-cover" unoptimized={isSvg(image)} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {project.homepageUrl ? (
                <a href={project.homepageUrl} target="_blank" rel="noreferrer" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800">
                  {copy.openDemo}
                </a>
              ) : null}
              {project.publicSourceUrl ? (
                <a href={project.publicSourceUrl} target="_blank" rel="noreferrer" className="rounded-full border border-zinc-950/15 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50">
                  {copy.openSource}
                </a>
              ) : (
                <p className="text-sm leading-6 text-zinc-600">{copy.noSource}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
