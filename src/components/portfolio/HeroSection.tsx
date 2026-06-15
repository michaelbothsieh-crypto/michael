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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_18%,rgba(125,211,252,0.22),transparent_34%),radial-gradient(circle_at_12%_70%,rgba(250,204,21,0.12),transparent_32%),linear-gradient(180deg,#0b0b0b,#050505)]" />
      <div className="absolute right-6 top-28 -z-10 hidden h-[48vw] max-h-[620px] w-[34vw] max-w-[480px] overflow-hidden rounded-[8px] border border-white/10 bg-white/5 lg:block">
        <Image
          src={heroPreview}
          alt=""
          width={1440}
          height={960}
          className="h-full w-full object-cover opacity-75 grayscale contrast-125"
          unoptimized={isSvg(heroPreview)}
          priority
        />
      </div>
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.34em] text-cyan-200">{copy.eyebrow}</p>
          <h1 className="mt-8 max-w-6xl text-[clamp(3rem,6vw,6.8rem)] font-semibold leading-[0.92] tracking-normal text-white">
            {copy.headlineA}{" "}
            <span className="relative inline-block h-10 w-24 overflow-hidden rounded-full align-middle ring-1 ring-white/20 sm:h-12 sm:w-32">
              <Image src={inlinePreview} alt="" width={320} height={120} className="h-full w-full object-cover" unoptimized={isSvg(inlinePreview)} />
            </span>{" "}
            {copy.headlineB} {copy.headlineC}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300">{copy.intro}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="#featured" className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:bg-cyan-100">
              {copy.primaryAction}
            </a>
            <a href="#projects" className="rounded-full border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10">
              {copy.secondaryAction}
            </a>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
          <Meta label="Repos" value={`${projectsCount}`} />
          <Meta label="Featured" value={`${featuredProjects.length}`} />
          <Meta label="Mode" value="Product Lab" />
        </div>
      </div>
    </section>
  );
}
