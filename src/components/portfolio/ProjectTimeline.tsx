"use client";

import { useState } from "react";
import type { Locale, Project } from "@/lib/projects";

type Props = { projects: Project[]; locale: Locale };

export function ProjectTimeline({ projects, locale }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Sort by createdAt, skip ones with no valid date
  const sorted = [...projects]
    .filter((p) => p.createdAt)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (sorted.length < 2) return null;

  const times = sorted.map((p) => new Date(p.createdAt).getTime());
  const minT = times[0];
  const maxT = times[times.length - 1];
  const span = maxT - minT || 1;

  // Stack projects in the same month so dots don't overlap
  const monthBucket: Record<string, number> = {};
  const stackIndex = sorted.map((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const idx = monthBucket[key] ?? 0;
    monthBucket[key] = idx + 1;
    return idx;
  });
  const maxStack = Math.max(...Object.values(monthBucket)) - 1;

  // Unique months for X-axis labels
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

  return (
    <section className="px-5 sm:px-8 lg:px-12 pb-16 pt-2">
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-zinc-500">
          {locale === "zh" ? "專案產出時間軸" : "Project timeline"}
        </p>
        <div className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 1000 ${SVG_H}`}
            className="w-full min-w-[480px]"
            style={{ overflow: "visible" }}
          >
            {/* Axis line */}
            <line x1={0} y1={AXIS_Y} x2={1000} y2={AXIS_Y} stroke="#d4d0c6" strokeWidth="1" />

            {/* Month labels */}
            {monthLabels.map(({ label, pct }) => (
              <text
                key={label}
                x={pct * 980 + 10}
                y={AXIS_Y + 16}
                fontSize="9"
                fill="#a1a1aa"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}

            {/* Project dots */}
            {sorted.map((p, i) => {
              const pct = (times[i] - minT) / span;
              const cx = pct * 980 + 10;
              const cy = AXIS_Y - DOT_R - stackIndex[i] * ROW_H;
              const isHovered = hovered === p.slug;

              return (
                <g
                  key={p.slug}
                  onMouseEnter={() => setHovered(p.slug)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setHovered((v) => v === p.slug ? null : p.slug)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Tick on axis */}
                  <line x1={cx} y1={AXIS_Y} x2={cx} y2={AXIS_Y - 6} stroke="#d4d0c6" strokeWidth="1" />

                  {/* Dot */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? DOT_R + 2 : DOT_R}
                    fill={isHovered ? "#4f6546" : "#5d6f4f"}
                    opacity={isHovered ? 1 : 0.75}
                    style={{ transition: "r 0.15s, opacity 0.15s" }}
                  />

                  {/* Tooltip */}
                  {isHovered && (
                    <g>
                      <rect
                        x={cx - 80}
                        y={cy - 36}
                        width={160}
                        height={26}
                        rx={5}
                        fill="#1c1f17"
                        opacity={0.92}
                      />
                      <text
                        x={cx}
                        y={cy - 19}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#f1efe7"
                        fontWeight="600"
                      >
                        {p.title[locale].length > 22
                          ? p.title[locale].slice(0, 21) + "…"
                          : p.title[locale]}
                      </text>
                      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="8" fill="#a1a1aa">
                        {new Date(p.createdAt).toLocaleDateString(
                          locale === "zh" ? "zh-TW" : "en-US",
                          { year: "numeric", month: "short" }
                        )}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
