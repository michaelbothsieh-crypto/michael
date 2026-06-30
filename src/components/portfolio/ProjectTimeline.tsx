"use client";

import { useState } from "react";
import type { Locale, Project } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";

type Props = { projects: Project[]; locale: Locale; onOpen?: (p: Project) => void };
type HoveredDot = { project: Project; cx: number; cy: number };

export function ProjectTimeline({ projects, locale, onOpen }: Props) {
  const [hovered, setHovered] = useState<HoveredDot | null>(null);

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
  const SVG_W = 1000;
  const SVG_H = 60 + maxStack * ROW_H;
  const AXIS_Y = SVG_H - 28;

  return (
    <section className="px-5 sm:px-8 lg:px-12 pb-16 pt-2">
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">
          {locale === "zh" ? "專案產出時間軸" : "Project timeline"}
        </p>

        <div className="overflow-x-auto">
          <div
            className="relative min-w-[480px]"
            style={{ paddingTop: `${(SVG_H / SVG_W) * 100}%` }}
          >
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="absolute inset-0 w-full h-full"
            >
              <line x1={0} y1={AXIS_Y} x2={SVG_W} y2={AXIS_Y} stroke="#d4d0c6" strokeWidth="1" />

              {monthLabels.map(({ label, pct }) => (
                <text key={label} x={pct * 980 + 10} y={AXIS_Y + 16} fontSize="9" fill="#a1a1aa" textAnchor="middle">
                  {label}
                </text>
              ))}

              {sorted.map((p, i) => {
                const pct = (times[i] - minT) / span;
                const cx = pct * 980 + 10;
                const cy = AXIS_Y - DOT_R - stackIndex[i] * ROW_H;
                const isHovered = hovered?.project.slug === p.slug;

                return (
                  <g
                    key={p.slug}
                    style={{ cursor: onOpen ? "pointer" : "default" }}
                    onMouseEnter={() => setHovered({ project: p, cx, cy })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onOpen?.(p)}
                  >
                    {/* larger invisible hit area */}
                    <circle cx={cx} cy={cy} r={DOT_R + 8} fill="transparent" />
                    <circle cx={cx} cy={AXIS_Y} r={2} fill="#d4d0c6" />
                    <line
                      x1={cx} y1={AXIS_Y - 2} x2={cx} y2={cy + DOT_R + 2}
                      stroke="#d4d0c6" strokeWidth="1" strokeDasharray="2 2"
                      opacity={isHovered ? 1 : 0}
                      style={{ transition: "opacity 0.12s" }}
                    />
                    <circle
                      cx={cx} cy={cy}
                      r={isHovered ? DOT_R + 2 : DOT_R}
                      fill={isHovered ? "#4f6546" : "#5d6f4f"}
                      opacity={isHovered ? 1 : 0.7}
                      style={{ transition: "all 0.12s" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Tooltip — hover-only, pointer-events: none so it never blocks dots */}
            {hovered && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `clamp(4px, calc(${hovered.cx / SVG_W * 100}% - 100px), calc(100% - 204px))`,
                  top: `calc(${hovered.cy / SVG_H * 100}% - 8px)`,
                  transform: "translateY(-100%)",
                }}
              >
                <div className="w-[200px] rounded-lg bg-[#1c1f17] px-4 py-3 shadow-xl">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 mb-0.5">
                    {categoryLabels[hovered.project.category][locale]}
                    {" · "}
                    {new Date(hovered.project.createdAt).toLocaleDateString(
                      locale === "zh" ? "zh-TW" : "en-US",
                      { year: "numeric", month: "short" }
                    )}
                  </p>
                  <p className="text-sm font-semibold text-[#f1efe7] leading-snug">
                    {hovered.project.title[locale]}
                  </p>
                  {onOpen && (
                    <p className="mt-1.5 text-[10px] font-mono text-[#7a9e6e]">
                      {locale === "zh" ? "點擊查看詳情 →" : "Click to view →"}
                    </p>
                  )}
                </div>
                <div className="w-0 h-0 mx-auto" style={{
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: "6px solid #1c1f17",
                }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
