import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "src", "data");
const outputPath = path.join(dataDir, "repos.generated.json");

const fields = [
  "name",
  "nameWithOwner",
  "description",
  "visibility",
  "isPrivate",
  "createdAt",
  "updatedAt",
  "primaryLanguage",
  "repositoryTopics",
  "homepageUrl",
  "url",
  "isArchived",
  "isFork",
  "stargazerCount",
  "forkCount",
].join(",");

const raw = execFileSync("gh", [
  "repo",
  "list",
  "--limit",
  "1000",
  "--json",
  fields,
], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"],
});

const repos = JSON.parse(raw)
  .filter((repo) => !repo.isArchived)
  .filter((repo) => repo.nameWithOwner !== "michaelbothsieh-crypto/michael")
  .map((repo) => ({
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description ?? "",
    visibility: repo.visibility,
    isPrivate: Boolean(repo.isPrivate),
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
    primaryLanguage: repo.primaryLanguage?.name ?? null,
    topics: (repo.repositoryTopics ?? []).map((topic) => topic.name).filter(Boolean),
    homepageUrl: repo.homepageUrl ?? "",
    url: repo.url,
    isArchived: Boolean(repo.isArchived),
    isFork: Boolean(repo.isFork),
    stargazerCount: repo.stargazerCount ?? 0,
    forkCount: repo.forkCount ?? 0,
  }))
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

// 防呆：本帳號一定有私有 repo。若一個都沒抓到，幾乎可確定是 token 權限不足
// （例如 classic token 缺 `repo` scope、或 fine-grained token 沒給私有 repo 讀取權）。
// 此時直接中止，避免把含私有專案的清單覆寫成只剩公開 repo 的殘缺版本。
const privateCount = repos.filter((repo) => repo.isPrivate).length;
if (privateCount === 0) {
  console.error(
    `Aborting: fetched ${repos.length} repos but 0 are private. ` +
      "The token likely lacks private-repo read access — refusing to overwrite repos.generated.json.",
  );
  process.exit(1);
}

mkdirSync(dataDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(repos, null, 2)}\n`);

console.log(`Synced ${repos.length} repositories to ${path.relative(root, outputPath)}`);

// ---------------------------------------------------------------------------
// 自動產生 README 的「全部專案矩陣」區塊。
// 兩份 README 各自在 <!-- AUTO:projects --> 與 <!-- /AUTO:projects --> 之間，
// 由本腳本依 repos.generated.json + project-overrides.json 重新生成，
// 新增 repo 後就不會再讓表格過時。
// ---------------------------------------------------------------------------

let overrides = {};
try {
  overrides = JSON.parse(readFileSync(path.join(dataDir, "project-overrides.json"), "utf8"));
} catch {
  // 沒有 overrides 也能跑，只是少了分類與亮點欄位的精修
}

const CATEGORY_LABELS = {
  "Financial Intelligence": { en: "Financial Intelligence", zh: "金融決策" },
  "AI Automation": { en: "AI Automation", zh: "AI 自動化" },
  "Product Utilities": { en: "Product Utilities", zh: "工具產品" },
  "Business Sites": { en: "Business Sites", zh: "企業網站" },
  "Data & Research": { en: "Data & Research", zh: "資料研究" },
  Experiments: { en: "Experiments", zh: "實驗原型" },
};

const T = {
  en: {
    intro: (n) =>
      `A consolidated matrix of all ${n} active projects — auto-generated from live GitHub metadata, so it never goes stale.`,
    project: "Project",
    category: "Category",
    stack: "Stack",
    highlights: "Highlights",
    links: "Links",
    demo: "Demo",
    code: "GitHub",
  },
  zh: {
    intro: (n) =>
      `以下為全部 ${n} 個進行中專案的矩陣，由 GitHub 即時資料自動產生，不會再過時。`,
    project: "專案",
    category: "產品線",
    stack: "技術",
    highlights: "亮點",
    links: "連結",
    demo: "Demo",
    code: "GitHub",
  },
};

/** 沒有 override 分類時的簡易推斷（與前端 fallback 邏輯一致） */
function deriveCategory(repo) {
  const text = `${repo.name} ${repo.description} ${repo.topics.join(" ")}`.toLowerCase();
  if (/(stock|warrant|insider|financial|smc|broker|disposal|punish)/.test(text)) return "Financial Intelligence";
  if (/(ai|bot|tube|podcast|gemini|summary|automation)/.test(text)) return "AI Automation";
  if (/(clinic|web|pwa|corporate|site)/.test(text)) return "Business Sites";
  if (/(price|radar|data|analysis|viewer|profiler|travel)/.test(text)) return "Data & Research";
  return "Product Utilities";
}

const escapeCell = (text) => String(text).replace(/\|/g, "\\|").replace(/\n/g, " ").trim();

function buildMatrix(lang) {
  const t = T[lang];
  const ordered = [...repos].sort((a, b) => {
    const wa = overrides[a.name]?.sortWeight ?? 0;
    const wb = overrides[b.name]?.sortWeight ?? 0;
    if (wb !== wa) return wb - wa;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const rows = ordered.map((repo) => {
    const ov = overrides[repo.name];
    const category = ov?.category ?? deriveCategory(repo);
    const categoryLabel = CATEGORY_LABELS[category]?.[lang] ?? category;

    const stack = repo.primaryLanguage ?? "—";

    const features = ov?.features?.[lang];
    const highlights = Array.isArray(features) && features.length
      ? features.slice(0, 3).join(" · ")
      : repo.description || "—";

    const links = [];
    if (repo.homepageUrl) links.push(`[${t.demo}](${repo.homepageUrl})`);
    links.push(`[${t.code}](${repo.url})`);
    if (repo.isPrivate) links.push("🔒");

    return `| [${repo.name}](${repo.url}) | ${categoryLabel} | ${escapeCell(stack)} | ${escapeCell(highlights)} | ${links.join(" · ")} |`;
  });

  return [
    t.intro(ordered.length),
    "",
    `| ${t.project} | ${t.category} | ${t.stack} | ${t.highlights} | ${t.links} |`,
    "| :--- | :--- | :--- | :--- | :--- |",
    ...rows,
  ].join("\n");
}

function injectMatrix(file, lang) {
  const start = "<!-- AUTO:projects -->";
  const end = "<!-- /AUTO:projects -->";
  let md;
  try {
    md = readFileSync(file, "utf8");
  } catch {
    return;
  }
  const s = md.indexOf(start);
  const e = md.indexOf(end);
  if (s === -1 || e === -1 || e < s) {
    console.warn(`Skipped ${path.basename(file)}: AUTO:projects markers not found`);
    return;
  }
  const next = `${md.slice(0, s + start.length)}\n${buildMatrix(lang)}\n${md.slice(e)}`;
  if (next !== md) {
    writeFileSync(file, next);
    console.log(`Updated project matrix in ${path.relative(root, file)}`);
  }
}

injectMatrix(path.join(root, "README.md"), "en");
injectMatrix(path.join(root, "README.zh-TW.md"), "zh");
