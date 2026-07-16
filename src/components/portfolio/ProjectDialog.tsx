"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Locale, ProjectSummary } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";
import type { PortfolioCopy } from "./copy";
import { isSvg } from "./format";

type ProjectDialogProps = {
  project: ProjectSummary;
  locale: Locale;
  copy: PortfolioCopy;
  onClose: () => void;
};

export function ProjectDialog({ project, locale, copy, onClose }: ProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="project-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto bg-[var(--background)] p-0 text-[var(--foreground)] shadow-2xl backdrop:bg-zinc-950/75"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="relative aspect-[16/10] min-h-56 overflow-hidden bg-zinc-950 lg:aspect-auto lg:h-full">
          <Image
            src={project.previewPath}
            alt=""
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
            unoptimized={isSvg(project.previewPath)}
          />
        </div>

        <div className="relative flex flex-col p-6 sm:p-8 lg:p-10">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="absolute right-4 top-4 grid size-11 place-items-center border border-zinc-950/20 bg-[var(--background)] text-xl transition-colors hover:bg-zinc-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={locale === "zh" ? "關閉作品預覽" : "Close project preview"}
          >
            ×
          </button>

          <p className="pr-14 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-[var(--accent)]">
            {categoryLabels[project.category][locale]}
          </p>
          <h2 id="project-dialog-title" className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
            {project.title[locale]}
          </h2>
          <p className="mt-5 text-base leading-7 text-zinc-600">{project.summary[locale]}</p>

          <ul className="mt-8 border-t border-zinc-950/15">
            {project.features[locale].slice(0, 4).map((feature) => (
              <li key={feature} className="border-b border-zinc-950/15 py-3 text-sm text-zinc-600">{feature}</li>
            ))}
          </ul>

          {project.homepageUrl ? (
            <a
              href={project.homepageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-11 items-center justify-between border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {copy.liveDemo}<span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
