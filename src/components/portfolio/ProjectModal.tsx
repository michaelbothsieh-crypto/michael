import Image from "next/image";
import type { Locale, Project } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { formatDate } from "./format";
import { Meta } from "./Meta";

type ProjectModalProps = {
  project: Project | null;
  locale: Locale;
  copy: PortfolioCopy;
  onClose: () => void;
};

export function ProjectModal({ project, locale, copy, onClose }: ProjectModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="project-title">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[8px] border border-white/12 bg-[#101010] shadow-2xl">
        <div className="relative aspect-[16/8] overflow-hidden bg-black">
          <Image
            src={project.previewPath}
            alt={`${project.title[locale]} preview`}
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-90"
            unoptimized={project.previewPath.endsWith(".svg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent" />
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
            onClick={onClose}
          >
            {copy.close}
          </button>
        </div>
        <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">{categoryLabels[project.category][locale]}</p>
            <h3 id="project-title" className="mt-4 text-4xl font-semibold text-white">
              {project.title[locale]}
            </h3>
            <p className="mt-5 text-lg leading-8 text-zinc-300">{project.summary[locale]}</p>
            <ul className="mt-6 grid gap-3">
              {project.features[locale].map((feature) => (
                <li key={feature} className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200">
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <aside className="space-y-6">
            <div className="grid grid-cols-2 gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
              <Meta label={copy.created} value={formatDate(project.createdAt, locale)} />
              <Meta label={copy.updated} value={formatDate(project.updatedAt, locale)} />
              <Meta label={copy.stack} value={project.primaryLanguage ?? "Mixed"} />
              <Meta label="Preview" value={project.previewStatus} />
            </div>
            <div className="flex flex-wrap gap-3">
              {project.homepageUrl ? (
                <a href={project.homepageUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                  {copy.openDemo}
                </a>
              ) : null}
              {project.publicSourceUrl ? (
                <a href={project.publicSourceUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  {copy.openSource}
                </a>
              ) : (
                <p className="text-sm leading-6 text-zinc-400">{copy.noSource}</p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
