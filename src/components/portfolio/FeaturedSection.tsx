import type { Locale, Project } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { ProjectCard } from "./ProjectCard";

type FeaturedSectionProps = {
  projects: Project[];
  totalProjects: number;
  locale: Locale;
  copy: PortfolioCopy;
  onOpenProject: (project: Project) => void;
};

export function FeaturedSection({ projects, totalProjects, locale, copy, onOpenProject }: FeaturedSectionProps) {
  return (
    <section id="featured" className="px-5 py-28 sm:px-8 md:py-40 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="gsap-reveal mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-4xl font-semibold text-zinc-950 md:text-6xl">{copy.featured}</h2>
            <p className="mt-4 max-w-2xl text-zinc-600">{copy.featuredIntro}</p>
          </div>
          <p className="font-mono text-sm text-zinc-500">
            {totalProjects} {copy.projectsCount}
          </p>
        </div>
        <div className="grid grid-flow-dense grid-cols-1 gap-4 lg:grid-cols-12">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} locale={locale} copy={copy} featured onOpen={onOpenProject} />
          ))}
        </div>
      </div>
    </section>
  );
}
