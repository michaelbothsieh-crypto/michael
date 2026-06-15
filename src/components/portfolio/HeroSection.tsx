import Image from "next/image";
import type { Project } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { Meta } from "./Meta";

type HeroSectionProps = {
  projectsCount: number;
  featuredProjects: Project[];
  copy: PortfolioCopy;
};

function isSvg(path: string) {
  return path.endsWith(".svg");
}

export function HeroSection({ projectsCount, featuredProjects, copy }: HeroSectionProps) {
  const heroPreview = featuredProjects[0]?.previewPath ?? "/previews/placeholder.svg";
  const inlinePreview = featuredProjects[1]?.previewPath ?? heroPreview;

  return (
    <section id="top" className="relative isolate flex min-h-[92vh] items-end px-5 pb-16 pt-28 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.20),transparent_34%),radial-gradient(circle_at_12%_72%,rgba(250,204,21,0.20),transparent_30%),linear-gradient(180deg,#f8fafc,#edf7f2)]" />
      <div className="absolute right-6 top-28 -z-10 hidden h-[48vw] max-h-[620px] w-[34vw] max-w-[480px] overflow-hidden rounded-[8px] border border-zinc-950/10 bg-white shadow-2xl shadow-zinc-950/10 lg:block">
        <Image
          src={heroPreview}
          alt=""
          width={1440}
          height={960}
          className="h-full w-full object-cover opacity-90 contrast-110"
          unoptimized={isSvg(heroPreview)}
          priority
          loading="eager"
        />
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.34em] text-teal-700">{copy.eyebrow}</p>
          <h1 className="mt-8 max-w-6xl text-[clamp(3rem,6vw,6.8rem)] font-semibold leading-[0.92] tracking-normal text-zinc-950">
            {copy.headlineA}{" "}
            <span className="relative inline-block h-10 w-24 overflow-hidden rounded-full align-middle ring-1 ring-zinc-950/15 sm:h-12 sm:w-32">
              <Image src={inlinePreview} alt="" width={320} height={120} className="h-full w-full object-cover" unoptimized={isSvg(inlinePreview)} loading="eager" />
            </span>{" "}
            {copy.headlineB} {copy.headlineC}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-700">{copy.intro}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#featured" className="rounded-full bg-zinc-950 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-teal-800">
              {copy.primaryAction}
            </a>
            <a href="#projects" className="rounded-full border border-zinc-950/15 px-6 py-3 text-center text-sm font-semibold text-zinc-950 transition hover:bg-white">
              {copy.secondaryAction}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-[8px] border border-zinc-950/10 bg-white/72 p-4 shadow-xl shadow-zinc-950/5">
          <Meta label="Repos" value={`${projectsCount}`} />
          <Meta label="Featured" value={`${featuredProjects.length}`} />
          <Meta label="Mode" value="Product Lab" />
        </div>
      </div>
    </section>
  );
}
