"use client";

import { useMemo, useState } from "react";
import type { CategoryFilter, Locale, Project } from "@/lib/projects";
import { filterProjectsByCategory, selectFeaturedProjects } from "@/lib/projects";
import { CategoryStory } from "./portfolio/CategoryStory";
import { copy } from "./portfolio/copy";
import { FeaturedSection } from "./portfolio/FeaturedSection";
import { HeroSection } from "./portfolio/HeroSection";
import { PortfolioNav } from "./portfolio/PortfolioNav";
import { ProjectGridSection } from "./portfolio/ProjectGridSection";
import { ProjectModal } from "./portfolio/ProjectModal";
import { usePortfolioMotion } from "./portfolio/usePortfolioMotion";

type Props = {
  projects: Project[];
};

export function PortfolioExperience({ projects }: Props) {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const t = copy[locale];

  const featuredProjects = useMemo(() => selectFeaturedProjects(projects), [projects]);
  const filteredProjects = useMemo(() => filterProjectsByCategory(projects, activeCategory), [activeCategory, projects]);

  usePortfolioMotion();

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f4f7f5] text-zinc-950">
      <PortfolioNav locale={locale} copy={t} onToggleLocale={() => setLocale(locale === "zh" ? "en" : "zh")} />
      <HeroSection projectsCount={projects.length} featuredProjects={featuredProjects} copy={t} />
      <FeaturedSection projects={featuredProjects} totalProjects={projects.length} locale={locale} copy={t} onOpenProject={setSelectedProject} />
      <CategoryStory copy={t} />
      <ProjectGridSection
        activeCategory={activeCategory}
        projects={filteredProjects}
        locale={locale}
        copy={t}
        onCategoryChange={setActiveCategory}
        onOpenProject={setSelectedProject}
      />
      <footer className="border-t border-zinc-950/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row">
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">{t.footer}</p>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Michael Product Lab</p>
        </div>
      </footer>
      <ProjectModal project={selectedProject} locale={locale} copy={t} onClose={() => setSelectedProject(null)} />
    </main>
  );
}
