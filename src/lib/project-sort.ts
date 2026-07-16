export type ProjectSortOrder = "updated-desc" | "created-desc" | "created-asc";

type DatedProject = {
  name: string;
  createdAt: string;
  updatedAt: string;
};

type RankedProject = DatedProject & {
  homepageUrl: string;
  sortWeight: number;
};

const timestamp = (value: string) => Date.parse(value) || 0;

export function sortProjectsByTime<T extends DatedProject>(projects: T[], order: ProjectSortOrder): T[] {
  const field = order === "updated-desc" ? "updatedAt" : "createdAt";
  const direction = order === "created-asc" ? 1 : -1;

  return [...projects].sort((a, b) => {
    const byTime = (timestamp(a[field]) - timestamp(b[field])) * direction;
    return byTime || a.name.localeCompare(b.name);
  });
}

export function selectStrongestProjects<T extends RankedProject>(projects: T[], limit = 8): T[] {
  return [...projects]
    .filter((project) => project.homepageUrl.trim())
    .sort((a, b) => b.sortWeight - a.sortWeight || timestamp(b.updatedAt) - timestamp(a.updatedAt) || a.name.localeCompare(b.name))
    .slice(0, limit);
}
