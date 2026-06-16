"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryFilter, Locale, Project } from "@/lib/projects";
import { filterProjectsByCategory, selectFeaturedProjects } from "@/lib/projects";
import { CategoryStory } from "./portfolio/CategoryStory";
import { copy } from "./portfolio/copy";
import { FeaturedSection } from "./portfolio/FeaturedSection";
import { HeroSection } from "./portfolio/HeroSection";
import { PortfolioNav } from "./portfolio/PortfolioNav";
import { ProjectGridSection } from "./portfolio/ProjectGridSection";
import { ProjectModal } from "./portfolio/ProjectModal";

type Props = {
  projects: Project[];
};

export function PortfolioExperience({ projects }: Props) {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<{ pv: number; active: number } | null>(null);
  const [projectPvs, setProjectPvs] = useState<Record<string, number>>({});
  const t = copy[locale];

  useEffect(() => {
    let uuid = sessionStorage.getItem("portfolio_user_uuid");
    if (!uuid) {
      uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("portfolio_user_uuid", uuid);
    }

    const updateStats = async (isNew = false) => {
      try {
        const res = await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uuid, isNewVisit: isNew }),
        });
        if (res.ok) {
          const data = await res.json();
          setStats({ pv: data.pv, active: data.active });
          if (data.projectPvs) {
            setProjectPvs(data.projectPvs);
          }
        }
      } catch (err) {
        console.error("Failed to update stats:", err);
      }
    };

    updateStats(true);
    const interval = setInterval(() => updateStats(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const trackProjectView = async (slug: string) => {
    let uuid = sessionStorage.getItem("portfolio_user_uuid");
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid, isNewVisit: false, projectSlug: slug }),
      });
      if (res.ok) {
        const data = await res.json();
        setStats({ pv: data.pv, active: data.active });
        if (data.projectPvs) {
          setProjectPvs(data.projectPvs);
        }
      }
    } catch (err) {
      console.error("Failed to track project view:", err);
    }
  };

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    trackProjectView(project.slug);
  };

  const featuredProjects = useMemo(() => selectFeaturedProjects(projects), [projects]);
  const filteredProjects = useMemo(() => filterProjectsByCategory(projects, activeCategory), [activeCategory, projects]);


  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f4f7f5] text-zinc-950">
      <PortfolioNav locale={locale} copy={t} stats={stats} onToggleLocale={() => setLocale(locale === "zh" ? "en" : "zh")} />
      <HeroSection projectsCount={projects.length} featuredProjects={featuredProjects} locale={locale} copy={t} />
      <FeaturedSection projects={featuredProjects} totalProjects={projects.length} locale={locale} copy={t} onOpenProject={handleOpenProject} />
      <CategoryStory copy={t} />
      <ProjectGridSection
        activeCategory={activeCategory}
        projects={filteredProjects}
        locale={locale}
        copy={t}
        onCategoryChange={setActiveCategory}
        onOpenProject={handleOpenProject}
      />
      <footer className="border-t border-zinc-950/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row">
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">{t.footer}</p>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Michael Product Lab</p>
        </div>
      </footer>
      <ProjectModal project={selectedProject} views={selectedProject ? (projectPvs[selectedProject.slug] ?? 0) : 0} locale={locale} copy={t} onClose={() => setSelectedProject(null)} />
    </main>
  );
}
