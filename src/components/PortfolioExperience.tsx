"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { sortProjectsByTime } from "@/lib/project-sort";
import type { ProjectSortOrder } from "@/lib/project-sort";
import type { CategoryFilter, Locale, ProjectSummary } from "@/lib/projects";
import { filterProjectsByCategory, selectFeaturedProjects } from "@/lib/projects";
import { CategoryStory } from "./portfolio/CategoryStory";
import { ProjectTimeline } from "./portfolio/ProjectTimeline";
import { copy } from "./portfolio/copy";
import { FeaturedSection } from "./portfolio/FeaturedSection";
import { HeroSection } from "./portfolio/HeroSection";
import { PortfolioNav } from "./portfolio/PortfolioNav";
import { ProjectGridSection } from "./portfolio/ProjectGridSection";

type Props = {
  projects: ProjectSummary[];
};

const emptySubscribe = () => () => {};
const PAGE_SIZE = 12;

export function PortfolioExperience({ projects }: Props) {
  // Server renders "en"; browser locale is only known client-side. useSyncExternalStore
  // with a server snapshot keeps the hydrated tree identical to the server HTML.
  const detectedLocale = useSyncExternalStore<Locale>(
    emptySubscribe,
    () => (navigator.language.startsWith("zh") ? "zh" : "en"),
    () => "en"
  );
  const [localeOverride, setLocaleOverride] = useState<Locale | null>(null);
  const locale = localeOverride ?? detectedLocale;
  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale]);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [activeSort, setActiveSort] = useState<ProjectSortOrder>("updated-desc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [stats, setStats] = useState<{ pv: number; active: number } | null>(null);
  const t = copy[locale];
  const featuredProjects = useMemo(() => selectFeaturedProjects(projects), [projects]);
  const filteredProjects = useMemo(
    () => sortProjectsByTime(filterProjectsByCategory(projects, activeCategory), activeSort),
    [activeCategory, activeSort, projects]
  );
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const sinceYear = useMemo(() => {
    const years = projects.map(p => new Date(p.createdAt).getFullYear()).filter(Boolean);
    return years.length ? Math.min(...years) : new Date().getFullYear();
  }, [projects]);

  const postStats = useCallback(async (payload: Record<string, unknown>) => {
    const uuid = sessionStorage.getItem("portfolio_user_uuid");
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, ...payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setStats({ pv: data.pv, active: data.active });
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("portfolio_user_uuid");
    if (!stored) sessionStorage.setItem("portfolio_user_uuid", crypto.randomUUID());
    // setState happens inside the fetch callback, not synchronously in the effect body
    // eslint-disable-next-line react-hooks/set-state-in-effect
    postStats({ isNewVisit: true });
    const onVisible = () => { if (document.visibilityState === "visible") postStats({ isNewVisit: false }); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [postStats]);

  const handleCategoryChange = (category: CategoryFilter) => {
    setActiveCategory(category);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSortChange = (sort: ProjectSortOrder) => {
    setActiveSort(sort);
    setVisibleCount(PAGE_SIZE);
  };

  const handleLoadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredProjects.length));
  }, [filteredProjects.length]);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f1efe7] text-zinc-950">
      <PortfolioNav copy={t} stats={stats} onToggleLocale={() => setLocaleOverride(locale === "zh" ? "en" : "zh")} />
      <HeroSection projectsCount={projects.length} featuredProjects={featuredProjects} sinceYear={sinceYear} locale={locale} copy={t} />
      <ProjectTimeline projects={projects} locale={locale} />
      <FeaturedSection projects={featuredProjects} locale={locale} copy={t} />
      <CategoryStory copy={t} />
      <ProjectGridSection
        activeCategory={activeCategory}
        activeSort={activeSort}
        projects={visibleProjects}
        totalProjects={filteredProjects.length}
        hasMore={visibleCount < filteredProjects.length}
        locale={locale}
        copy={t}
        onCategoryChange={handleCategoryChange}
        onSortChange={handleSortChange}
        onLoadMore={handleLoadMore}
      />
      <footer className="border-t border-zinc-950/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row">
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">{t.footer}</p>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Michael Product Lab</p>
        </div>
      </footer>
    </main>
  );
}
