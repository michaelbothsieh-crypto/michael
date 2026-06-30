"use client";

import Image from "next/image";
import type { Locale, Project } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";

type HeroSectionProps = {
  projectsCount: number;
  featuredProjects: Project[];
  sinceYear: number;
  locale: Locale;
  copy: PortfolioCopy;
};

function isSvg(path: string) {
  return path.endsWith(".svg");
}

/// HeroSection component for portfolio landing page
/// Renders the headline, intro paragraph, project statistics, and macOS-style interactive showcase window
export function HeroSection({ projectsCount, featuredProjects, sinceYear, locale, copy }: HeroSectionProps) {
  const heroPreview = featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg";

  return (
    <section id="top" className="relative isolate bg-[#f1efe7] px-5 pb-20 pt-32 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14">
        <div className="gsap-hero-copy max-w-5xl">
          <div className="inline-flex items-center gap-2 border border-zinc-950/12 bg-white/70 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-zinc-700">
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5d6f4f]"></span>
            </span>
            {copy.eyebrow}
          </div>

          <h1 className="mt-7 text-[clamp(2.9rem,6vw,6.2rem)] font-semibold leading-[1.02] tracking-tight text-zinc-950">
            {copy.headline}{" "}
            <span className="relative inline-block text-[#4f6546] pb-1">
              {copy.headlineAccent}
            </span>
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <p className="max-w-3xl text-lg leading-8 text-zinc-700">{copy.intro}</p>

            <div className="grid grid-cols-3 gap-5 py-2">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">Repos</p>
                <p className="mt-1 font-mono text-sm text-zinc-900">{projectsCount}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">Since</p>
                <p className="mt-1 font-mono text-sm text-zinc-900">{sinceYear}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">Focus</p>
                <p className="mt-1 font-mono text-sm text-zinc-900">{locale === "zh" ? "產品系統" : "Product systems"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a 
              href="#featured" 
              className="group relative overflow-hidden bg-[#1f211b] px-7 py-3.5 text-center text-sm font-semibold text-[#f7f4ea] shadow-sm shadow-zinc-950/10 transition-colors duration-200 hover:bg-[#4f6546]"
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {copy.primaryAction}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </a>
            <a 
              href="#projects" 
              className="border border-zinc-950/15 bg-white/55 px-7 py-3.5 text-center text-sm font-semibold text-zinc-950 transition-colors duration-200 hover:bg-white/85 hover:border-zinc-950/30"
            >
              {copy.secondaryAction}
            </a>
          </div>
        </div>

        <div className="gsap-hero-preview grid overflow-hidden border border-zinc-950/10 bg-white shadow-sm lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          <div className="relative aspect-[16/10] min-h-[320px] bg-zinc-950 lg:aspect-auto">
            <Image
              src={heroPreview}
              alt=""
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover opacity-95 contrast-[1.03]"
              unoptimized={isSvg(heroPreview)}
              loading="eager"
            />
          </div>
          <div className="flex flex-col justify-between gap-10 p-6 sm:p-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Featured case</p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-zinc-950">
                {featuredProjects[0]?.title[locale] ?? "Product case"}
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                {featuredProjects[0]?.summary[locale] ?? copy.featuredIntro}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(featuredProjects[0]?.features[locale] ?? []).slice(0, 4).map((feature) => (
                <span key={feature} className="border border-zinc-950/10 bg-zinc-50 px-2.5 py-1 font-mono text-[0.68rem] text-zinc-600">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
