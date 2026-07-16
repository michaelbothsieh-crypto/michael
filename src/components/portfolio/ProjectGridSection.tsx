"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ProjectSortOrder } from "@/lib/project-sort";
import type { CategoryFilter, Locale, ProjectSummary } from "@/lib/projects";
import { categories, categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { formatDate, isSvg } from "./format";

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
  onProjectSelect: (project: ProjectSummary) => void;
};

export function ProjectGridSection({ activeCategory, activeSort, projects, totalProjects, hasMore, locale, copy, onCategoryChange, onSortChange, onLoadMore, onProjectSelect }: ProjectGridSectionProps) {
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
    <section id="projects" className="px-5 pb-28 sm:px-8 md:pb-40 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="portfolio-enter grid gap-5 border-b border-zinc-950/20 pb-8 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--accent)]">Product archive / {totalProjects}</p>
            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.04em] text-zinc-950 md:text-7xl">{copy.allProjects}</h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-zinc-600 lg:justify-self-end">{copy.archiveIntro}</p>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-b border-zinc-950/20 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {(["All", ...categories] as CategoryFilter[]).map((category) => (
              <button
                key={category}
                type="button"
                className={`min-h-11 border-b-2 px-0 text-sm transition-colors ${activeCategory === category ? "border-zinc-950 text-zinc-950" : "border-transparent text-zinc-500 hover:text-zinc-950"}`}
                onClick={() => onCategoryChange(category)}
              >
                {category === "All" ? copy.all : categoryLabels[category][locale]}
              </button>
            ))}
          </div>
          <label className="flex min-h-11 items-center gap-3 text-sm text-zinc-600">
            <span>{copy.sortLabel}</span>
            <select
              value={activeSort}
              onChange={(event) => onSortChange(event.target.value as ProjectSortOrder)}
              className="min-h-11 border border-zinc-950/20 bg-transparent px-3 py-2 text-sm text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <option value="updated-desc">{copy.sortUpdated}</option>
              <option value="created-desc">{copy.sortNewest}</option>
              <option value="created-asc">{copy.sortOldest}</option>
            </select>
          </label>
        </div>

        {projects.length ? (
          <>
            <p aria-live="polite" className="py-5 font-mono text-xs text-zinc-500">
              {copy.showing} {projects.length} {copy.of} {totalProjects}
            </p>
            <div className="border-t border-zinc-950/20">
              {projects.map((project, index) => (
                <button
                  key={project.name}
                  type="button"
                  onClick={() => onProjectSelect(project)}
                  className="group grid w-full min-h-28 grid-cols-[5.5rem_minmax(0,1fr)_1.5rem] items-center gap-4 border-b border-zinc-950/15 py-5 text-left focus:outline-none focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)] md:grid-cols-[6.5rem_minmax(0,1fr)_11rem_7rem_2rem] md:gap-5"
                >
                  <span className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                    <Image src={project.previewPath} alt="" fill sizes="104px" className="object-cover opacity-90 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100" unoptimized={isSvg(project.previewPath)} />
                    <span className="absolute left-1.5 top-1.5 bg-zinc-950/80 px-1.5 py-1 font-mono text-[0.58rem] text-white">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold leading-tight text-zinc-950 transition-transform duration-200 group-hover:translate-x-1 md:text-xl">{project.title[locale]}</span>
                    <span className="mt-2 line-clamp-2 block text-sm leading-5 text-zinc-500">{project.summary[locale]}</span>
                    <span className="mt-2 block font-mono text-[0.65rem] text-[var(--accent)] md:hidden">{categoryLabels[project.category][locale]}</span>
                  </span>
                  <span className="hidden text-sm text-zinc-600 md:block">{categoryLabels[project.category][locale]}</span>
                  <span className="hidden font-mono text-xs text-zinc-500 md:block">{formatDate(project.updatedAt, locale)}</span>
                  <span aria-hidden="true" className="text-right text-lg text-zinc-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-zinc-950">→</span>
                </button>
              ))}
            </div>
            {hasMore ? <div ref={loadMoreRef} aria-hidden="true" className="h-px" /> : null}
          </>
        ) : (
          <p role="status" className="border-b border-zinc-950/15 px-2 py-12 text-center text-zinc-600">{copy.noProjects}</p>
        )}
      </div>
    </section>
  );
}
