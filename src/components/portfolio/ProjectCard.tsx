import Image from "next/image";
import type { Locale, Project } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { formatDate } from "./format";
import { Meta } from "./Meta";

type ProjectCardProps = {
  project: Project;
  locale: Locale;
  copy: PortfolioCopy;
  featured?: boolean;
  onOpen: (project: Project) => void;
};

export function ProjectCard({ project, locale, copy, featured = false, onOpen }: ProjectCardProps) {
  return (
    <article
      className={`group grid overflow-hidden rounded-[8px] border border-zinc-950/10 bg-white shadow-xl shadow-zinc-950/5 transition duration-500 hover:-translate-y-1 hover:border-teal-600/35 hover:shadow-2xl hover:shadow-zinc-950/10 ${
        featured ? "lg:col-span-4 first:lg:col-span-6 [&:nth-child(2)]:lg:col-span-6" : ""
      }`}
    >
      <button
        type="button"
        className="flex h-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
        onClick={() => onOpen(project)}
      >
        <div className="motion-image relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
          <Image
            src={project.previewPath}
            alt={`${project.title[locale]} preview`}
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-85 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            unoptimized={project.previewPath.endsWith(".svg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-[6px] border border-white/40 bg-white/80 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-zinc-950 backdrop-blur">
            {categoryLabels[project.category][locale]}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div>
            <h3 className="text-xl font-semibold leading-tight text-zinc-950">{project.title[locale]}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{project.problem[locale]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[project.primaryLanguage, ...project.topics].filter(Boolean).slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-[6px] border border-zinc-950/10 bg-zinc-50 px-2.5 py-1 font-mono text-[0.7rem] text-zinc-600">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-950/10 pt-4">
            <Meta label={copy.created} value={formatDate(project.createdAt, locale)} />
            <Meta label={copy.updated} value={formatDate(project.updatedAt, locale)} />
          </div>
        </div>
      </button>
    </article>
  );
}
