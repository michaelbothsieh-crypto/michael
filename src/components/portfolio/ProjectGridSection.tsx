import type { CategoryFilter, Locale, Project } from "@/lib/projects";
import { categories, categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { ProjectCard } from "./ProjectCard";

type ProjectGridSectionProps = {
  activeCategory: CategoryFilter;
  projects: Project[];
  locale: Locale;
  copy: PortfolioCopy;
  onCategoryChange: (category: CategoryFilter) => void;
  onOpenProject: (project: Project) => void;
};

export function ProjectGridSection({ activeCategory, projects, locale, copy, onCategoryChange, onOpenProject }: ProjectGridSectionProps) {
  return (
    <section id="projects" className="px-5 pb-28 sm:px-8 md:pb-44 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="gsap-reveal mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <h2 className="text-4xl font-semibold text-zinc-950 md:text-6xl">{copy.allProjects}</h2>
          <div className="flex flex-wrap gap-2">
            {(["All", ...categories] as CategoryFilter[]).map((category) => (
              <button
                key={category}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${activeCategory === category ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-950/15 bg-white text-zinc-600 hover:text-zinc-950"}`}
                onClick={() => onCategoryChange(category)}
              >
                {category === "All" ? copy.all : categoryLabels[category][locale]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} locale={locale} copy={copy} onOpen={onOpenProject} />
          ))}
        </div>
      </div>
    </section>
  );
}
