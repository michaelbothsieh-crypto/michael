import previewManifestJson from "@/data/preview-manifest.generated.json";
import overridesJson from "@/data/project-overrides.json";
import reposJson from "@/data/repos.generated.json";
import { selectStrongestProjects } from "./project-sort";

export type Locale = "zh" | "en";

export type Category =
  | "Financial Intelligence"
  | "AI Automation"
  | "Product Utilities"
  | "Business Sites"
  | "Data & Research"
  | "Experiments";

export type GitHubRepo = {
  name: string;
  nameWithOwner: string;
  description: string;
  visibility: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  primaryLanguage: string | null;
  topics: string[];
  readmeFeatures?: string[];
  homepageUrl: string;
  url: string;
  isArchived: boolean;
  isFork: boolean;
  stargazerCount: number;
  forkCount: number;
};

type LocalizedText = Record<Locale, string>;
type LocalizedList = Record<Locale, string[]>;

export const pillarKeys = ["observability", "caching", "security", "reproducibility"] as const;
export type PillarKey = (typeof pillarKeys)[number];
export type EngineeringPillars = Partial<Record<PillarKey, LocalizedText>>;

type ProjectOverride = {
  category: Category;
  featured: boolean;
  sortWeight: number;
  title: LocalizedText;
  summary: LocalizedText;
  features: LocalizedList;
  problem?: LocalizedText;
  challenge?: LocalizedText;
  impact?: LocalizedText;
  workflow?: LocalizedText;
  commands?: LocalizedList;
  gallery?: string[];
  previewPath?: string;
  homepageUrl?: string;
  engineeringPillars?: EngineeringPillars;
};

type PreviewEntry = {
  status: "captured" | "fallback";
  source?: string;
  reason?: string;
  path: string;
  demoStatus?: "healthy" | "unhealthy";
  demoReason?: string;
};

export type Project = GitHubRepo & {
  slug: string;
  category: Category;
  featured: boolean;
  sortWeight: number;
  title: LocalizedText;
  summary: LocalizedText;
  features: LocalizedList;
  problem: LocalizedText;
  challenge?: LocalizedText;
  impact?: LocalizedText;
  workflow?: LocalizedText;
  commands?: LocalizedList;
  gallery: string[];
  previewPath: string;
  previewStatus: "captured" | "fallback" | "missing";
  publicSourceUrl: string | null;
  engineeringPillars?: EngineeringPillars;
};

export type ProjectSummary = Pick<
  Project,
  | "name"
  | "slug"
  | "category"
  | "sortWeight"
  | "title"
  | "summary"
  | "features"
  | "createdAt"
  | "updatedAt"
  | "primaryLanguage"
  | "topics"
  | "homepageUrl"
  | "previewPath"
>;

export type CategoryFilter = Category | "All";

export const categoryLabels: Record<Category, LocalizedText> = {
  "Financial Intelligence": {
    zh: "金融決策",
    en: "Financial Intelligence",
  },
  "AI Automation": {
    zh: "AI 自動化",
    en: "AI Automation",
  },
  "Product Utilities": {
    zh: "工具產品",
    en: "Product Utilities",
  },
  "Business Sites": {
    zh: "企業網站",
    en: "Business Sites",
  },
  "Data & Research": {
    zh: "資料研究",
    en: "Data & Research",
  },
  Experiments: {
    zh: "實驗原型",
    en: "Experiments",
  },
};

export const categories = Object.keys(categoryLabels) as Category[];

const repos = reposJson as GitHubRepo[];
const overrides = overridesJson as Record<string, ProjectOverride>;
const previewManifest = previewManifestJson as Record<string, PreviewEntry>;

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fallbackCategory(repo: GitHubRepo): Category {
  const text = `${repo.name} ${repo.description} ${repo.topics.join(" ")}`.toLowerCase();

  if (/(stock|warrant|insider|financial|smc|broker|disposal|punish)/.test(text)) {
    return "Financial Intelligence";
  }

  if (/(ai|bot|tube|podcast|gemini|summary|automation)/.test(text)) {
    return "AI Automation";
  }

  if (/(clinic|web|pwa|corporate|site)/.test(text)) {
    return "Business Sites";
  }

  if (/(price|radar|data|analysis|viewer|profiler|travel)/.test(text)) {
    return "Data & Research";
  }

  return "Product Utilities";
}

function fallbackTitle(repo: GitHubRepo): LocalizedText {
  const title = repo.name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return { zh: title, en: title };
}

function fallbackSummary(repo: GitHubRepo): LocalizedText {
  const description = repo.description || "一個持續整理中的產品案例。";
  return {
    zh: description,
    en: repo.description || "A product case currently being curated.",
  };
}

export function getProjects(): Project[] {
  return repos
    .map((repo) => {
      const override = overrides[repo.name];
      const preview = previewManifest[repo.name];
      const category = override?.category ?? fallbackCategory(repo);
      const slug = slugify(repo.name);
      const previewPath = override?.previewPath ?? preview?.path ?? `/previews/${slug}.svg`;
      const summary = override?.summary ?? fallbackSummary(repo);

      return {
        ...repo,
        slug,
        category,
        featured: Boolean(override?.featured),
        sortWeight: override?.sortWeight ?? 0,
        title: override?.title ?? fallbackTitle(repo),
        summary,
        problem: override?.problem ?? summary,
        challenge: override?.challenge,
        impact: override?.impact,
        workflow: override?.workflow,
        commands: override?.commands,
        features: override?.features ?? {
          zh: repo.topics.length ? repo.topics : repo.readmeFeatures?.length ? repo.readmeFeatures : [categoryLabels[category].zh],
          en: repo.topics.length ? repo.topics : repo.readmeFeatures?.length ? repo.readmeFeatures : [categoryLabels[category].en],
        },
        homepageUrl: override?.homepageUrl ?? (preview?.demoStatus === "unhealthy" || (preview?.status === "fallback" && preview?.reason?.startsWith("http ")) ? "" : repo.homepageUrl),
        previewPath,
        gallery: override?.gallery ?? [previewPath],
        previewStatus: preview?.status ?? "missing",
        publicSourceUrl: repo.isPrivate ? null : repo.url,
        engineeringPillars: override?.engineeringPillars,
      };
    })
    .sort((a, b) => {
      if (b.sortWeight !== a.sortWeight) return b.sortWeight - a.sortWeight;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function getProjectBySlug(slug: string) {
  return getProjects().find((project) => project.slug === slug);
}

export function toProjectSummary(project: Project): ProjectSummary {
  const { name, slug, category, sortWeight, title, summary, features, createdAt, updatedAt, primaryLanguage, topics, homepageUrl, previewPath } = project;
  return { name, slug, category, sortWeight, title, summary, features, createdAt, updatedAt, primaryLanguage, topics, homepageUrl, previewPath };
}

export function selectFeaturedProjects<T extends ProjectSummary>(projects: T[], limit = 8) {
  return selectStrongestProjects(projects, limit);
}

export function filterProjectsByCategory<T extends Pick<Project, "category">>(projects: T[], activeCategory: CategoryFilter) {
  if (activeCategory === "All") return projects;
  return projects.filter((project) => project.category === activeCategory);
}
