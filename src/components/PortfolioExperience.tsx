"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { sortProjectsByTime } from "@/lib/project-sort";
import type { ProjectSortOrder } from "@/lib/project-sort";
import type { CategoryFilter, Locale, ProjectSummary } from "@/lib/projects";
import { filterProjectsByCategory, selectFeaturedProjects } from "@/lib/projects";
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
  const featuredProjects = useMemo(() => selectFeaturedProjects(projects, 3), [projects]);
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
      <HeroSection projectsCount={projects.length} sinceYear={sinceYear} locale={locale} copy={t} />
      <FeaturedSection projects={featuredProjects} locale={locale} copy={t} />
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
      <footer className="bg-zinc-950 px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#aeba9f]">Michael Product Lab</p>
            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">{t.footerTitle}</h2>
          </div>
          <div className="border-t border-white/20 pt-6">
            <p className="text-sm leading-6 text-zinc-400">{t.footer}</p>
            <a
              href="https://github.com/michaelbothsieh-crypto"
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex min-h-11 items-center justify-between border border-white/30 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t.footerAction}<span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
