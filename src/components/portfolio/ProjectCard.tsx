import Image from "next/image";
import Link from "next/link";
import type { Locale, ProjectSummary } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { formatDate, isSvg } from "./format";

type ProjectCardProps = {
  project: ProjectSummary;
  locale: Locale;
  copy: PortfolioCopy;
  featured?: boolean;
};

const SERVICE_TAGS: Array<[keyword: string, tag: string]> = [
  ["github actions", "GitHub Actions"],
  ["neon", "Neon DB"],
  ["render", "Render"],
];

export function ProjectCard({ project, locale, copy, featured = false }: ProjectCardProps) {
  const features = project.features[locale].map((f) => f.toLowerCase());
  const serviceTags = SERVICE_TAGS
    .filter(([keyword]) => features.some((f) => f.includes(keyword)))
    .map(([, tag]) => tag);
  const tagsToShow = ([...serviceTags, project.primaryLanguage, ...project.topics].filter(Boolean) as string[]).slice(0, 5);

  return (
    <article
      className={`portfolio-enter group grid overflow-hidden rounded-[8px] border border-zinc-950/10 bg-white shadow-sm shadow-zinc-950/5 transition duration-300 hover:-translate-y-0.5 hover:border-zinc-950/20 hover:shadow-md hover:shadow-zinc-950/10 ${
        featured ? "lg:col-span-3 first:lg:col-span-6 [&:nth-child(2)]:lg:col-span-6" : ""
      }`}
    >
      <Link
        href={`/projects/${project.slug}`}
        prefetch={false}
        className="flex h-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5d6f4f]"
      >
        <div className="motion-image relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
          <Image
            src={project.previewPath}
            alt={`${project.title[locale]} preview`}
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-90 transition duration-500 ease-out group-hover:scale-[1.025] group-hover:opacity-100"
            unoptimized={isSvg(project.previewPath)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-[6px] border border-white/40 bg-white/80 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-zinc-950 backdrop-blur">
            {categoryLabels[project.category][locale]}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div>
            <h3 className="text-xl font-semibold leading-tight text-zinc-950">{project.title[locale]}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{project.summary[locale]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tagsToShow.map((tag) => {
              const isService = serviceTags.includes(tag);
              return (
                <span
                  key={tag}
                  className={`rounded-[6px] px-2.5 py-1 font-mono text-[0.7rem] ${
                    isService
                      ? "border border-[#5d6f4f]/25 bg-[#eef1e7] text-[#4f6546] font-medium"
                      : "border border-zinc-950/10 bg-zinc-50 text-zinc-600"
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-zinc-950/10 pt-4">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">{copy.created}</p>
              <p className="mt-1 font-mono text-xs text-zinc-800">{formatDate(project.createdAt, locale)}</p>
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">{copy.updated}</p>
              <p className="mt-1 font-mono text-xs text-zinc-800">{formatDate(project.updatedAt, locale)}</p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
