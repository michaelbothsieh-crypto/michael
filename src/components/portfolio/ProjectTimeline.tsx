"use client";

import { useState } from "react";
import type { Locale, Project } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";

type Props = { projects: Project[]; locale: Locale; onOpen?: (p: Project) => void };

export function ProjectTimeline({ projects, locale, onOpen }: Props) {
  const [active, setActive] = useState<Project | null>(null);

  const sorted = [...projects]
    .filter((p) => p.createdAt)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (sorted.length < 2) return null;

  const times = sorted.map((p) => new Date(p.createdAt).getTime());
  const minT = times[0];
  const maxT = times[times.length - 1];
  const span = maxT - minT || 1;

  const monthBucket: Record<string, number> = {};
  const stackIndex = sorted.map((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const idx = monthBucket[key] ?? 0;
    monthBucket[key] = idx + 1;
    return idx;
  });
  const maxStack = Math.max(...Object.values(monthBucket)) - 1;

  const monthLabels: { label: string; pct: number }[] = [];
  const seen = new Set<string>();
  for (const p of sorted) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      monthLabels.push({
        label: `${names[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
        pct: (new Date(d.getFullYear(), d.getMonth(), 1).getTime() - minT) / span,
      });
    }
  }

  const DOT_R = 6;
  const ROW_H = 20;
  const SVG_H = 60 + maxStack * ROW_H;
  const AXIS_Y = SVG_H - 28;

  return (
    <section className="px-5 sm:px-8 lg:px-12 pb-16 pt-2">
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">
          {locale === "zh" ? "專案產出時間軸" : "Project timeline"}
        </p>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 1000 ${SVG_H}`} className="w-full min-w-[480px]">
            <line x1={0} y1={AXIS_Y} x2={1000} y2={AXIS_Y} stroke="#d4d0c6" strokeWidth="1" />

            {monthLabels.map(({ label, pct }) => (
              <text key={label} x={pct * 980 + 10} y={AXIS_Y + 16} fontSize="9" fill="#a1a1aa" textAnchor="middle">
                {label}
              </text>
            ))}

            {sorted.map((p, i) => {
              const pct = (times[i] - minT) / span;
              const cx = pct * 980 + 10;
              const cy = AXIS_Y - DOT_R - stackIndex[i] * ROW_H;
              const isActive = active?.slug === p.slug;

              return (
                <g
                  key={p.slug}
                  onMouseEnter={() => setActive(p)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive((v) => v?.slug === p.slug ? null : p)}
                  style={{ cursor: "pointer" }}
                >
                  <circle cx={cx} cy={AXIS_Y} r={2} fill="#d4d0c6" />
                  <line x1={cx} y1={AXIS_Y - 2} x2={cx} y2={cy + DOT_R + 2} stroke="#d4d0c6" strokeWidth="1" strokeDasharray="2 2" opacity={isActive ? 1 : 0} />
                  <circle
                    cx={cx} cy={cy}
                    r={isActive ? DOT_R + 2 : DOT_R}
                    fill={isActive ? "#4f6546" : "#5d6f4f"}
                    opacity={isActive ? 1 : 0.7}
                    style={{ transition: "all 0.15s" }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail card below the chart */}
        <div className={`mt-4 overflow-hidden transition-all duration-200 ${active ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
          {active && (
            <div className="flex items-start justify-between gap-6 rounded-lg border border-zinc-950/10 bg-white px-6 py-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-zinc-400">
                    {categoryLabels[active.category][locale]}
                  </span>
                  <span className="text-zinc-300">·</span>
                  <span className="font-mono text-[0.6rem] text-zinc-400">
                    {new Date(active.createdAt).toLocaleDateString(
                      locale === "zh" ? "zh-TW" : "en-US",
                      { year: "numeric", month: "long" }
                    )}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-950 truncate">{active.title[locale]}</h3>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600 line-clamp-2">{active.summary[locale]}</p>
              </div>
              {onOpen && (
                <button
                  type="button"
                  onClick={() => onOpen(active)}
                  className="shrink-0 self-center border border-zinc-950/15 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-950 hover:text-white transition-colors"
                >
                  {locale === "zh" ? "查看" : "View"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
