"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale, Project } from "@/lib/projects";
import { categoryLabels } from "@/lib/projects";

type Props = { projects: Project[]; locale: Locale; onOpen?: (p: Project) => void };

type ActiveDot = { project: Project; cx: number; cy: number };

export function ProjectTimeline({ projects, locale, onOpen }: Props) {
  const [active, setActive] = useState<ActiveDot | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Dismiss on outside click
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setActive(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active]);

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

        <div className="overflow-x-auto" ref={wrapRef}>
          {/* Aspect-ratio wrapper so tooltip % positions match SVG coords */}
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
                const isActive = active?.project.slug === p.slug;

                return (
                  <g
                    key={p.slug}
                    onClick={() => setActive((v) => v?.project.slug === p.slug ? null : { project: p, cx, cy })}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={cx} cy={AXIS_Y} r={2} fill="#d4d0c6" />
                    <line x1={cx} y1={AXIS_Y - 2} x2={cx} y2={cy + DOT_R + 2}
                      stroke="#d4d0c6" strokeWidth="1" strokeDasharray="2 2"
                      style={{ opacity: isActive ? 1 : 0, transition: "opacity 0.15s" }}
                    />
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

            {/* Tooltip — positioned above the active dot, click-only */}
            {active && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute z-20 pointer-events-auto"
                style={{
                  left: `clamp(4px, calc(${active.cx / SVG_W * 100}% - 100px), calc(100% - 204px))`,
                  top: `calc(${active.cy / SVG_H * 100}% - 8px)`,
                  transform: "translateY(-100%)",
                }}
              >
                <div className="w-[200px] rounded-lg bg-[#1c1f17] px-4 py-3 shadow-xl">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 mb-0.5">
                    {categoryLabels[active.project.category][locale]}
                    {" · "}
                    {new Date(active.project.createdAt).toLocaleDateString(
                      locale === "zh" ? "zh-TW" : "en-US",
                      { year: "numeric", month: "short" }
                    )}
                  </p>
                  <p className="text-sm font-semibold text-[#f1efe7] leading-snug truncate">
                    {active.project.title[locale]}
                  </p>
                  {onOpen && (
                    <button
                      type="button"
                      onClick={() => { onOpen(active.project); setActive(null); }}
                      className="mt-2 text-[10px] font-mono text-[#7a9e6e] hover:text-[#a8c89a] transition-colors"
                    >
                      {locale === "zh" ? "查看詳情 →" : "View details →"}
                    </button>
                  )}
                </div>
                {/* Arrow pointing down */}
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
