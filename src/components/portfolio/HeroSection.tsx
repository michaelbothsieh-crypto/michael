"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { Locale, Project } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { Meta } from "./Meta";

type HeroSectionProps = {
  projectsCount: number;
  featuredProjects: Project[];
  locale: Locale;
  copy: PortfolioCopy;
};

function isSvg(path: string) {
  return path.endsWith(".svg");
}

/// HeroSection component for portfolio landing page
/// Renders the headline, intro paragraph, project statistics, and macOS-style interactive showcase window
export function HeroSection({ projectsCount, featuredProjects, locale, copy }: HeroSectionProps) {
  const heroPreview = featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg";

  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(badgeRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: "power3.out" });
      gsap.fromTo(descRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(actionsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power3.out" });
      gsap.fromTo(windowRef.current, { opacity: 0, x: 50, rotate: 1 }, { opacity: 1, x: 0, rotate: -0.5, duration: 1.2, delay: 0.2, ease: "power4.out" });
      gsap.fromTo(statsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power3.out" });

      gsap.to(windowRef.current, {
        y: -12,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.4
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" className="relative isolate flex min-h-[92vh] items-end px-5 pb-16 pt-28 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 overflow-hidden bg-[linear-gradient(180deg,#f8fafc,#edf7f2)]">
        <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.25)_0%,transparent_60%)] filter blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute -right-1/4 -bottom-1/4 h-[80vw] w-[80vw] rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.22)_0%,transparent_60%)] filter blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute left-1/3 top-1/4 h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)] filter blur-3xl" />
      </div>

      <div 
        ref={windowRef}
        className="absolute right-8 top-28 -z-10 hidden h-[48vw] max-h-[600px] w-[34vw] max-w-[480px] overflow-hidden rounded-xl border border-zinc-950/10 bg-white/80 shadow-[0_25px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-4 hover:scale-[1.02] hover:shadow-[0_35px_70px_rgba(20,184,166,0.18)] lg:flex lg:flex-col"
      >
        <div className="flex items-center gap-1.5 border-b border-zinc-950/5 bg-zinc-50/80 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-rose-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
          <div className="ml-4 font-mono text-[10px] tracking-wider text-zinc-400">PRODUCT_SANDBOX.app</div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <Image
            src={heroPreview}
            alt=""
            width={1440}
            height={960}
            className="h-full w-full object-cover opacity-95 contrast-[1.05]"
            unoptimized={isSvg(heroPreview)}
            priority
            loading="eager"
          />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-teal-800 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            {copy.eyebrow}
          </div>

          <h1 ref={titleRef} className="mt-6 max-w-6xl text-[clamp(2.8rem,5.6vw,6.4rem)] font-extrabold leading-[0.94] tracking-tight text-zinc-950">
            {locale === "zh" ? (
              <>
                {copy.headlineA}{copy.headlineB}
                <span className="relative inline-block bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent pb-1">
                  {copy.headlineC}
                  <svg className="inline-block h-[0.7em] w-[0.7em] ml-2 text-teal-500 fill-current align-baseline animate-pulse" viewBox="0 0 24 24" style={{ animationDuration: "2s" }}>
                    <path d="M12 2c0 5.522-4.478 10-10 10 5.522 0 10 4.478 10 10 0-5.522 4.478-10 10-10-5.522 0-10-4.478-10-10z" />
                  </svg>
                </span>
              </>
            ) : (
              <>
                {copy.headlineA} {copy.headlineB}{" "}
                <span className="relative inline-block bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-500 bg-clip-text text-transparent pb-1">
                  {copy.headlineC}
                  <svg className="inline-block h-[0.7em] w-[0.7em] ml-2 text-teal-500 fill-current align-baseline animate-pulse" viewBox="0 0 24 24" style={{ animationDuration: "2s" }}>
                    <path d="M12 2c0 5.522-4.478 10-10 10 5.522 0 10 4.478 10 10 0-5.522 4.478-10 10-10-5.522 0-10-4.478-10-10z" />
                  </svg>
                </span>
              </>
            )}
          </h1>

          <p ref={descRef} className="mt-8 max-w-2xl text-lg leading-8 text-zinc-700">{copy.intro}</p>

          <div ref={actionsRef} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a 
              href="#featured" 
              className="group relative overflow-hidden rounded-full bg-zinc-950 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition-all duration-300 hover:bg-teal-800 hover:shadow-teal-700/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {copy.primaryAction}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </a>
            <a 
              href="#projects" 
              className="rounded-full border border-zinc-950/15 bg-white/40 backdrop-blur-sm px-8 py-3.5 text-center text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-white/80 hover:border-zinc-950/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              {copy.secondaryAction}
            </a>
          </div>
        </div>

        <div ref={statsRef} className="grid grid-cols-3 gap-3 rounded-xl border border-zinc-950/10 bg-white/60 p-4 shadow-xl shadow-zinc-950/5 backdrop-blur-md transition-all duration-300 hover:shadow-teal-600/5 hover:border-teal-500/10">
          <Meta label="Repos" value={`${projectsCount}`} />
          <Meta label="Featured" value={`${featuredProjects.length}`} />
          <Meta label="Mode" value="Product Lab" />
        </div>
      </div>
    </section>
  );
}
