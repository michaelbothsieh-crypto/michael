"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CategoryFilter, Locale, Project } from "@/lib/projects";
import { filterProjectsByCategory, selectFeaturedProjects } from "@/lib/projects";
import { CategoryStory } from "./portfolio/CategoryStory";
import { ProjectTimeline } from "./portfolio/ProjectTimeline";
import { copy } from "./portfolio/copy";
import { FeaturedSection } from "./portfolio/FeaturedSection";
import { HeroSection } from "./portfolio/HeroSection";
import { PortfolioNav } from "./portfolio/PortfolioNav";
import { ProjectGridSection } from "./portfolio/ProjectGridSection";
import { ProjectModal } from "./portfolio/ProjectModal";

type Props = {
  projects: Project[];
};

gsap.registerPlugin(useGSAP, ScrollTrigger);

const emptySubscribe = () => () => {};

export function PortfolioExperience({ projects }: Props) {
  const containerRef = useRef<HTMLElement>(null);
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<{ pv: number; active: number } | null>(null);
  const [projectPvs, setProjectPvs] = useState<Record<string, number>>({});
  const t = copy[locale];
  const featuredProjects = useMemo(() => selectFeaturedProjects(projects), [projects]);
  const filteredProjects = useMemo(() => filterProjectsByCategory(projects, activeCategory), [activeCategory, projects]);
  const sinceYear = useMemo(() => {
    const years = projects.map(p => new Date(p.createdAt).getFullYear()).filter(Boolean);
    return years.length ? Math.min(...years) : new Date().getFullYear();
  }, [projects]);

  // Choreographs first-load and scroll reveals inside this portfolio surface.
  useGSAP(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      gsap.set(".gsap-reveal, .gsap-project-card, .gsap-hero-preview", {
        clearProps: "all",
      });
      return;
    }

    gsap.from(".gsap-nav", { y: -8, duration: 0.3, ease: "power3.out" });
    gsap.from(".gsap-hero-copy > *, .gsap-hero-preview", {
      y: 14,
      duration: 0.45,
      ease: "power3.out",
      stagger: 0.04,
    });

    // Pre-hide before ScrollTrigger watches — prevents flash (visible → hidden → animate)
    gsap.set(".gsap-reveal", { autoAlpha: 0, y: 22 });
    gsap.set(".gsap-project-card", { autoAlpha: 0, y: 20 });

    gsap.utils.toArray<HTMLElement>(".gsap-reveal").forEach((element) => {
      gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          once: true,
        },
      });
    });

    ScrollTrigger.batch(".gsap-project-card", {
      start: "top 96%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.05,
          overwrite: true,
        });
      },
    });
  }, { scope: containerRef });

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
        if (data.projectPvs) setProjectPvs(data.projectPvs);
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

  const handleOpenProject = (project: Project) => {
    setSelectedProject(project);
    postStats({ isNewVisit: false, projectSlug: project.slug });
  };

  return (
    <main ref={containerRef} className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f1efe7] text-zinc-950">
      <PortfolioNav copy={t} stats={stats} onToggleLocale={() => setLocaleOverride(locale === "zh" ? "en" : "zh")} />
      <HeroSection projectsCount={projects.length} featuredProjects={featuredProjects} sinceYear={sinceYear} locale={locale} copy={t} />
      <ProjectTimeline projects={projects} locale={locale} onOpen={handleOpenProject} />
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
