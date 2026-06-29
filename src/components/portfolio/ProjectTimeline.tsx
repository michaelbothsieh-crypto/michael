"use client";

import { useRef, useState } from "react";
import type { Locale, Project } from "@/lib/projects";

type Props = { projects: Project[]; locale: Locale };

type TooltipState = { slug: string; pct: number } | null;

export function ProjectTimeline({ projects, locale }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const DOT_R = 5;
  const ROW_H = 18;
  const SVG_H = 56 + maxStack * ROW_H;
  const AXIS_Y = SVG_H - 28;

  const hoveredProject = tooltip ? sorted.find((p) => p.slug === tooltip.slug) : null;

  return (
    <section className="px-5 sm:px-8 lg:px-12 pb-16 pt-2">
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">
          {locale === "zh" ? "專案產出時間軸" : "Project timeline"}
        </p>

        {/* HTML tooltip — 不受 SVG overflow 限制 */}
        <div ref={containerRef} className="relative overflow-x-auto">
          {hoveredProject && (
            <div
              className="pointer-events-none absolute top-0 z-10"
              style={{
                left: `clamp(4px, calc(${tooltip!.pct * 100}% - 80px), calc(100% - 164px))`,
                transform: "translateY(-8px)",
              }}
            >
              <div className="rounded-md bg-[#1c1f17]/92 px-3 py-1.5 text-center backdrop-blur-sm">
                <p className="max-w-[156px] truncate text-[10px] font-semibold text-[#f1efe7]">
                  {hoveredProject.title[locale]}
                </p>
                <p className="mt-0.5 text-[8px] text-zinc-400">
                  {new Date(hoveredProject.createdAt).toLocaleDateString(
                    locale === "zh" ? "zh-TW" : "en-US",
                    { year: "numeric", month: "short" }
                  )}
                </p>
              </div>
            </div>
          )}

          <svg
            viewBox={`0 0 1000 ${SVG_H}`}
            className="w-full min-w-[480px]"
          >
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
              const isHovered = tooltip?.slug === p.slug;

              return (
                <g
                  key={p.slug}
                  onMouseEnter={() => setTooltip({ slug: p.slug, pct })}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => setTooltip((v) => v?.slug === p.slug ? null : { slug: p.slug, pct })}
                  style={{ cursor: "pointer" }}
                >
                  <line x1={cx} y1={AXIS_Y} x2={cx} y2={AXIS_Y - 6} stroke="#d4d0c6" strokeWidth="1" />
                  <circle
                    cx={cx} cy={cy}
                    r={isHovered ? DOT_R + 2 : DOT_R}
                    fill={isHovered ? "#4f6546" : "#5d6f4f"}
                    opacity={isHovered ? 1 : 0.75}
                    style={{ transition: "r 0.15s, opacity 0.15s" }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
