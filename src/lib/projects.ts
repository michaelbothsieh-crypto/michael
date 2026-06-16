import previewManifestJson from "@/data/preview-manifest.generated.json";
import overridesJson from "@/data/project-overrides.json";
import reposJson from "@/data/repos.generated.json";

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
  homepageUrl: string;
  url: string;
  isArchived: boolean;
  isFork: boolean;
  stargazerCount: number;
  forkCount: number;
};

type LocalizedText = Record<Locale, string>;
type LocalizedList = Record<Locale, string[]>;

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
  engineeringPillars?: {
    observability?: LocalizedText;
    caching?: LocalizedText;
    security?: LocalizedText;
    reproducibility?: LocalizedText;
  };
};

type PreviewEntry = {
  status: "captured" | "fallback";
  source?: string;
  reason?: string;
  path: string;
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
  engineeringPillars?: {
    observability?: LocalizedText;
    caching?: LocalizedText;
    security?: LocalizedText;
    reproducibility?: LocalizedText;
  };
};

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

  if (/(stock|warrant|insider|financial|smc|broker)/.test(text)) {
    return "Financial Intelligence";
  }

  if (/(ai|bot|tube|podcast|gemini|summary|automation)/.test(text)) {
    return "AI Automation";
  }

  if (/(clinic|web|pwa|corporate|site)/.test(text)) {
    return "Business Sites";
  }

  if (/(price|radar|data|analysis|viewer|profiler)/.test(text)) {
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

      return {
        ...repo,
        slug,
        category,
        featured: Boolean(override?.featured),
        sortWeight: override?.sortWeight ?? 0,
        title: override?.title ?? fallbackTitle(repo),
        summary: override?.summary ?? fallbackSummary(repo),
        problem: override?.problem ?? override?.summary ?? fallbackSummary(repo),
        challenge: override?.challenge,
        impact: override?.impact,
        workflow: override?.workflow,
        commands: override?.commands,
        features: override?.features ?? {
          zh: repo.topics.length ? repo.topics : [categoryLabels[category].zh],
          en: repo.topics.length ? repo.topics : [categoryLabels[category].en],
        },
        homepageUrl: override?.homepageUrl ?? ((preview?.status === "fallback" && preview?.reason === "http 404") ? "" : repo.homepageUrl),
        previewPath: override?.previewPath ?? preview?.path ?? `/previews/${slug}.svg`,
        gallery: override?.gallery ?? [override?.previewPath ?? preview?.path ?? `/previews/${slug}.svg`],
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

export function selectFeaturedProjects(projects: Project[], limit = 5) {
  return projects.filter((project) => project.featured).slice(0, limit);
}

export function filterProjectsByCategory(projects: Project[], activeCategory: CategoryFilter) {
  if (activeCategory === "All") return projects;
  return projects.filter((project) => project.category === activeCategory);
}
