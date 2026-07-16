import assert from "node:assert/strict";
import test from "node:test";
import { selectStrongestProjects, sortProjectsByTime } from "./project-sort.ts";

const projects = [
  { name: "older", createdAt: "2024-01-01", updatedAt: "2026-01-01", homepageUrl: "https://older.example", sortWeight: 10 },
  { name: "strong-no-demo", createdAt: "2025-01-01", updatedAt: "2025-03-01", homepageUrl: "", sortWeight: 100 },
  { name: "newer", createdAt: "2025-01-01", updatedAt: "2025-02-01", homepageUrl: "https://newer.example", sortWeight: 20 },
];

test("strongest projects require a demo URL", () => {
  assert.deepEqual(selectStrongestProjects(projects).map((project) => project.name), ["newer", "older"]);
});

test("projects sort by updated, newest created, and oldest created", () => {
  assert.deepEqual(sortProjectsByTime(projects, "updated-desc").map((project) => project.name), ["older", "strong-no-demo", "newer"]);
  assert.deepEqual(sortProjectsByTime(projects, "created-desc").map((project) => project.name), ["newer", "strong-no-demo", "older"]);
  assert.deepEqual(sortProjectsByTime(projects, "created-asc").map((project) => project.name), ["older", "newer", "strong-no-demo"]);
});
