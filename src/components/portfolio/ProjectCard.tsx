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
      className={`group grid overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20 transition duration-500 hover:border-cyan-200/35 hover:bg-white/[0.085] ${
        featured ? "lg:col-span-4 first:lg:col-span-7 first:lg:row-span-2 [&:nth-child(2)]:lg:col-span-5 [&:nth-child(3)]:lg:col-span-5" : ""
      }`}
    >
      <button
        type="button"
        className="flex h-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-[6px] border border-white/15 bg-black/45 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-zinc-100 backdrop-blur">
            {categoryLabels[project.category][locale]}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div>
            <h3 className="text-xl font-semibold leading-tight text-white">{project.title[locale]}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{project.summary[locale]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[project.primaryLanguage, ...project.topics].filter(Boolean).slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-[6px] border border-white/10 px-2.5 py-1 font-mono text-[0.7rem] text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <Meta label={copy.created} value={formatDate(project.createdAt, locale)} />
            <Meta label={copy.updated} value={formatDate(project.updatedAt, locale)} />
          </div>
        </div>
      </button>
    </article>
  );
}
