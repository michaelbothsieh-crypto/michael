"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Category, Locale, Project } from "@/lib/projects";
import { categories, categoryLabels } from "@/lib/projects";

type Props = {
  projects: Project[];
};

const copy = {
  zh: {
    nav: ["精選", "分類", "全部作品"],
    eyebrow: "MICHAEL PRODUCT LAB",
    headlineA: "把 AI、自動化",
    headlineB: "和資料產品",
    headlineC: "做成可用工具",
    intro:
      "這裡整理了我的 GitHub public 和 private 專案。每個 repo 都被當成一個產品案例來看：它解決什麼問題、怎麼被使用、目前維護到哪裡。",
    primaryAction: "看精選作品",
    secondaryAction: "瀏覽全部",
    featured: "精選產品",
    featuredIntro: "先看最能代表方向的幾個案例，再往下用分類慢慢翻。",
    categories: "用產品線瀏覽",
    all: "全部",
    allProjects: "全部作品",
    projectsCount: "個案例",
    created: "建立",
    updated: "更新",
    stack: "技術",
    openDemo: "Demo",
    openSource: "GitHub",
    close: "關閉",
    noSource: "這是內部或私人作品，所以這裡只展示產品脈絡與截圖。",
    footer:
      "部分作品是內部工具或客戶案例，因此只展示產品截圖與功能摘要。需要看更細的實作，再另外打開就好。",
  },
  en: {
    nav: ["Featured", "Categories", "All Work"],
    eyebrow: "MICHAEL PRODUCT LAB",
    headlineA: "Turning AI,",
    headlineB: "automation and data",
    headlineC: "into usable products",
    intro:
      "This portfolio organizes my public and private GitHub projects as product cases: what each one solves, how it is used, and how active it is.",
    primaryAction: "View featured",
    secondaryAction: "Browse all",
    featured: "Featured products",
    featuredIntro: "Start with the cases that best show the range, then browse the full set by product line.",
    categories: "Browse by product line",
    all: "All",
    allProjects: "All projects",
    projectsCount: "cases",
    created: "Created",
    updated: "Updated",
    stack: "Stack",
    openDemo: "Demo",
    openSource: "GitHub",
    close: "Close",
    noSource: "This is internal or private work, so the portfolio shows product context and screenshots instead of source.",
    footer:
      "Some projects are internal tools or client-facing work, so I show product context and screenshots instead of source links. Deeper implementation details can be opened case by case.",
  },
};

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-TW" : "en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-1 font-mono text-xs text-zinc-200">{value}</p>
    </div>
  );
}

function ProjectCard({
  project,
  locale,
  featured = false,
  onOpen,
}: {
  project: Project;
  locale: Locale;
  featured?: boolean;
  onOpen: (project: Project) => void;
}) {
  return (
    <article
      className={`group grid overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.055] shadow-2xl shadow-black/20 transition duration-500 hover:border-cyan-200/35 hover:bg-white/[0.085] ${
        featured ? "lg:col-span-4 first:lg:col-span-7 first:lg:row-span-2 [&:nth-child(2)]:lg:col-span-5 [&:nth-child(3)]:lg:col-span-5" : ""
      }`}
    >
      <button
        type="button"
        className="flex h-full flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
        onClick={() => onOpen(project)}
      >
        <div className="motion-image relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
          <Image
            src={project.previewPath}
            alt={`${project.title[locale]} preview`}
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-85 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
            unoptimized={project.previewPath.endsWith(".svg")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-[6px] border border-white/15 bg-black/45 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-zinc-100 backdrop-blur">
            {categoryLabels[project.category][locale]}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div>
            <h3 className="text-xl font-semibold leading-tight text-white">{project.title[locale]}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{project.summary[locale]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[project.primaryLanguage, ...project.topics].filter(Boolean).slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-[6px] border border-white/10 px-2.5 py-1 font-mono text-[0.7rem] text-zinc-300">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-auto grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
            <Meta label={copy[locale].created} value={formatDate(project.createdAt, locale)} />
            <Meta label={copy[locale].updated} value={formatDate(project.updatedAt, locale)} />
          </div>
        </div>
      </button>
    </article>
  );
}

export function PortfolioExperience({ projects }: Props) {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const t = copy[locale];

  const featuredProjects = useMemo(() => projects.filter((project) => project.featured).slice(0, 5), [projects]);
  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [activeCategory, projects]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        ".motion-image",
        { scale: 0.92, opacity: 0.62 },
        {
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".featured-grid",
            start: "top 80%",
            end: "bottom 30%",
            scrub: true,
          },
        },
      );

      gsap.fromTo(
        ".reveal-word",
        { opacity: 0.16, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: ".scroll-copy",
            start: "top 75%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );
    });

    return () => context.revert();
  }, []);

  return (
    <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#070707] text-zinc-100">
      <nav className="fixed left-1/2 top-4 z-40 flex w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-xl">
        <a href="#top" className="font-mono text-xs uppercase tracking-[0.24em] text-white">
          Michael
        </a>
        <div className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <a href="#featured" className="hover:text-white">{t.nav[0]}</a>
          <a href="#categories" className="hover:text-white">{t.nav[1]}</a>
          <a href="#projects" className="hover:text-white">{t.nav[2]}</a>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-xs text-white transition hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          aria-label="Switch language"
        >
          {locale === "zh" ? "EN" : "繁中"}
        </button>
      </nav>

      <section id="top" className="relative isolate flex min-h-[92vh] items-end px-5 pb-16 pt-28 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(125,211,252,0.22),transparent_34%),radial-gradient(circle_at_12%_70%,rgba(250,204,21,0.12),transparent_32%),linear-gradient(180deg,#0b0b0b,#050505)]" />
        <div className="absolute right-6 top-28 -z-10 hidden h-[48vw] max-h-[620px] w-[34vw] max-w-[480px] overflow-hidden rounded-[8px] border border-white/10 bg-white/5 lg:block">
          <Image
            src={featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg"}
            alt=""
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-75 grayscale contrast-125"
            unoptimized={(featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg").endsWith(".svg")}
          />
        </div>
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200">{t.eyebrow}</p>
            <h1 className="mt-8 max-w-6xl text-[clamp(3rem,6vw,6.8rem)] font-semibold leading-[0.92] tracking-normal text-white">
              {t.headlineA}{" "}
              <span className="relative inline-block h-10 w-24 overflow-hidden rounded-full align-middle ring-1 ring-white/20 sm:h-12 sm:w-32">
                <Image
                  src={featuredProjects[1]?.previewPath ?? featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg"}
                  alt=""
                  width={320}
                  height={120}
                  className="h-full w-full object-cover"
                  unoptimized={(featuredProjects[1]?.previewPath ?? featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg").endsWith(".svg")}
                />
              </span>{" "}
              {t.headlineB} {t.headlineC}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300">{t.intro}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="#featured" className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-cyan-100">
                {t.primaryAction}
              </a>
              <a href="#projects" className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
                {t.secondaryAction}
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
            <Meta label="Repos" value={`${projects.length}`} />
            <Meta label="Featured" value={`${featuredProjects.length}`} />
            <Meta label="Mode" value="Product Lab" />
          </div>
        </div>
      </section>

      <section id="featured" className="px-5 py-28 sm:px-8 md:py-40 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-4xl font-semibold text-white md:text-6xl">{t.featured}</h2>
              <p className="mt-4 max-w-2xl text-zinc-400">{t.featuredIntro}</p>
            </div>
            <p className="font-mono text-sm text-zinc-500">{projects.length} {t.projectsCount}</p>
          </div>
          <div className="featured-grid grid grid-flow-dense grid-cols-1 gap-4 lg:grid-cols-12">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.name} project={project} locale={locale} featured onOpen={setSelectedProject} />
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="scroll-copy px-5 py-24 sm:px-8 md:py-36 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <h2 className="text-4xl font-semibold leading-tight text-white md:text-6xl">{t.categories}</h2>
          <p className="text-2xl leading-relaxed text-zinc-300">
            {(locale === "zh"
              ? "金融決策、AI 自動化、資料研究、企業網站和工具產品放在同一個產品實驗室裡看，會比單純列 repo 更接近我真正想展示的東西。"
              : "Financial intelligence, AI automation, data research, business sites, and product utilities make more sense as a product lab than as a raw repo list."
            )
              .split(" ")
              .map((word, index) => (
                <span key={`${word}-${index}`} className="reveal-word inline-block pr-2">
                  {word}
                </span>
              ))}
          </p>
        </div>
      </section>

      <section id="projects" className="px-5 pb-28 sm:px-8 md:pb-44 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <h2 className="text-4xl font-semibold text-white md:text-6xl">{t.allProjects}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition ${activeCategory === "All" ? "border-white bg-white text-black" : "border-white/15 text-zinc-300 hover:bg-white/10"}`}
                onClick={() => setActiveCategory("All")}
              >
                {t.all}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition ${activeCategory === category ? "border-white bg-white text-black" : "border-white/15 text-zinc-300 hover:bg-white/10"}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {categoryLabels[category][locale]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.name} project={project} locale={locale} onOpen={setSelectedProject} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row">
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">{t.footer}</p>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-500">Michael Product Lab</p>
        </div>
      </footer>

      {selectedProject ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="project-title">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[8px] border border-white/12 bg-[#101010] shadow-2xl">
            <div className="relative aspect-[16/8] overflow-hidden bg-black">
              <Image
                src={selectedProject.previewPath}
                alt={`${selectedProject.title[locale]} preview`}
                width={1440}
                height={960}
                className="h-full w-full object-cover opacity-90"
                unoptimized={selectedProject.previewPath.endsWith(".svg")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent" />
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                onClick={() => setSelectedProject(null)}
              >
                {t.close}
              </button>
            </div>
            <div className="grid gap-8 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">{categoryLabels[selectedProject.category][locale]}</p>
                <h3 id="project-title" className="mt-4 text-4xl font-semibold text-white">{selectedProject.title[locale]}</h3>
                <p className="mt-5 text-lg leading-8 text-zinc-300">{selectedProject.summary[locale]}</p>
                <ul className="mt-6 grid gap-3">
                  {selectedProject.features[locale].map((feature) => (
                    <li key={feature} className="rounded-[8px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-200">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <Meta label={t.created} value={formatDate(selectedProject.createdAt, locale)} />
                  <Meta label={t.updated} value={formatDate(selectedProject.updatedAt, locale)} />
                  <Meta label={t.stack} value={selectedProject.primaryLanguage ?? "Mixed"} />
                  <Meta label="Preview" value={selectedProject.previewStatus} />
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedProject.homepageUrl ? (
                    <a href={selectedProject.homepageUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100">
                      {t.openDemo}
                    </a>
                  ) : null}
                  {selectedProject.publicSourceUrl ? (
                    <a href={selectedProject.publicSourceUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                      {t.openSource}
                    </a>
                  ) : (
                    <p className="text-sm leading-6 text-zinc-400">{t.noSource}</p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
