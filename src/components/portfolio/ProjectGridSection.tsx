"use client";

import { useEffect, useRef } from "react";
import type { ProjectSortOrder } from "@/lib/project-sort";
import type { CategoryFilter, Locale, ProjectSummary } from "@/lib/projects";
import { categories, categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { ProjectCard } from "./ProjectCard";

type ProjectGridSectionProps = {
  activeCategory: CategoryFilter;
  activeSort: ProjectSortOrder;
  projects: ProjectSummary[];
  totalProjects: number;
  hasMore: boolean;
  locale: Locale;
  copy: PortfolioCopy;
  onCategoryChange: (category: CategoryFilter) => void;
  onSortChange: (sort: ProjectSortOrder) => void;
  onLoadMore: () => void;
};

export function ProjectGridSection({ activeCategory, activeSort, projects, totalProjects, hasMore, locale, copy, onCategoryChange, onSortChange, onLoadMore }: ProjectGridSectionProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    }, { rootMargin: "400px 0px" });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore, projects.length]);

  return (
    <section id="projects" className="px-5 pb-28 sm:px-8 md:pb-44 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="portfolio-enter mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <h2 className="text-4xl font-semibold text-zinc-950 md:text-6xl">{copy.allProjects}</h2>
          <div className="grid gap-3">
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
            <label className="flex items-center gap-3 text-sm text-zinc-600 lg:justify-end">
              <span>{copy.sortLabel}</span>
              <select
                value={activeSort}
                onChange={(event) => onSortChange(event.target.value as ProjectSortOrder)}
                className="rounded-[6px] border border-zinc-950/15 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5d6f4f]"
              >
                <option value="updated-desc">{copy.sortUpdated}</option>
                <option value="created-desc">{copy.sortNewest}</option>
                <option value="created-asc">{copy.sortOldest}</option>
              </select>
            </label>
          </div>
        </div>
        {projects.length ? (
          <>
            <p aria-live="polite" className="mb-4 font-mono text-xs text-zinc-500">
              {copy.showing} {projects.length} {copy.of} {totalProjects}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.name} project={project} locale={locale} copy={copy} />
              ))}
            </div>
            {hasMore ? <div ref={loadMoreRef} aria-hidden="true" className="h-px" /> : null}
          </>
        ) : (
          <p role="status" className="border border-zinc-950/10 bg-white px-6 py-12 text-center text-zinc-600">{copy.noProjects}</p>
        )}
      </div>
    </section>
  );
}
