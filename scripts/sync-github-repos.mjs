import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dataDir = path.join(root, "src", "data");
const previewsDir = path.join(root, "public", "previews");
const outputPath = path.join(dataDir, "repos.generated.json");
const previewManifestPath = path.join(dataDir, "preview-manifest.generated.json");

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** 抓 repo 的 README 全文，沒有就回傳空字串。 */
function fetchReadme(nameWithOwner) {
  try {
    const b64 = execFileSync(
      "gh",
      ["api", `repos/${nameWithOwner}/readme`, "-q", ".content"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return "";
  }
}

/** README 第一段有意義的文字，當 GitHub description 是空的時候拿來當備援摘要。 */
function extractSummary(readme) {
  const line = readme
    .split("\n")
    .map((l) => l.replace(/^#+\s*/, "").replace(/[`*_>]/g, "").trim())
    .find((l) => l.length > 8 && !l.startsWith("![") && !l.startsWith("["));
  return line ?? "";
}

/**
 * 沒有 GitHub topics 又沒有人工 override 時，從 README 抓出可以當「功能」列表的東西：
 * 優先抓「## 功能／Features」段落底下的條列，沒有的話退而求其次抓 ### 小標題，
 * 都沒有就抓文件裡任何條列項目。抓不到就回傳空陣列，讓呼叫端自己 fallback。
 */
function extractFeatures(readme) {
  const lines = readme.split("\n");
  const bulletText = (line) => line.replace(/^[-*]\s+/, "").replace(/\*\*/g, "").trim();

  const featureSectionStart = lines.findIndex((l) => /^#{1,3}\s*(功能|features?)\b/i.test(l.trim()));
  if (featureSectionStart !== -1) {
    const bullets = [];
    for (let i = featureSectionStart + 1; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (/^#{1,3}\s/.test(line)) break;
      if (/^[-*]\s+/.test(line)) bullets.push(bulletText(line));
    }
    if (bullets.length) return bullets.slice(0, 6);
  }

  // ### 小標題常常是畫面/功能名稱（例如「看板」「匯總」），但如果是在「安裝／快速開始」
  // 這類章節底下，通常只是步驟編號，不該當作功能列出。
  const setupSection = /安裝|快速開始|quick start|setup|installation|開發環境|本機開發|getting started/i;
  let underSetupSection = false;
  const headings = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (/^##\s+/.test(line)) {
      underSetupSection = setupSection.test(line);
      continue;
    }
    if (/^###\s+/.test(line) && !underSetupSection) {
      const text = line.replace(/^###\s+/, "").replace(/[`*]/g, "").trim();
      if (!/^\d+[.)]/.test(text)) headings.push(text);
    }
  }
  if (headings.length >= 2) return headings.slice(0, 6);

  // 最後手段：文件裡任何條列項目，跳過安裝章節、程式碼區塊，並濾掉過長的敘述句。
  let inCodeBlock = false;
  underSetupSection = false;
  const bullets = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (/^##\s+/.test(line)) {
      underSetupSection = setupSection.test(line);
      continue;
    }
    if (inCodeBlock || underSetupSection) continue;
    if (/^[-*]\s+/.test(line)) {
      const text = bulletText(line);
      if (text.length > 0 && text.length <= 80) bullets.push(text);
    }
  }
  if (bullets.length >= 2) return bullets.slice(0, 6);

  return [];
}

/** 沒有任何截圖來源時，產生一張佔位 SVG，避免作品集頁面出現破圖。 */
function writePlaceholderSvg(repo, slug) {
  mkdirSync(previewsDir, { recursive: true });
  const svgPath = path.join(previewsDir, `${slug}.svg`);
  const label = repo.primaryLanguage ?? "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e9f3ef"/>
    </linearGradient>
    <radialGradient id="r" cx="75%" cy="20%" r="70%">
      <stop offset="0" stop-color="#c4b5fd" stop-opacity=".36"/>
      <stop offset="1" stop-color="#c4b5fd" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1440" height="960" fill="url(#g)"/>
  <rect width="1440" height="960" fill="url(#r)"/>
  <rect x="96" y="96" width="1248" height="768" rx="42" fill="#ffffff" stroke="#0f172a" stroke-opacity=".10"/>
  ${label ? `<rect x="150" y="160" width="260" height="52" rx="26" fill="#c4b5fd" opacity=".22"/>
  <text x="180" y="194" fill="#0f172a" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="5">${label.toUpperCase()}</text>` : ""}
  <text x="150" y="334" fill="#0f172a" font-family="Arial, sans-serif" font-size="72" font-weight="700">${repo.name}</text>
  <text x="150" y="424" fill="#3f3f46" font-family="Arial, sans-serif" font-size="34">No public product screen available</text>
  <path d="M150 670 C 360 520, 610 760, 860 610 S 1160 470, 1280 610" fill="none" stroke="#c4b5fd" stroke-width="7" opacity=".9"/>
  <circle cx="1190" cy="230" r="58" fill="#c4b5fd" opacity=".7"/>
</svg>
`;
  writeFileSync(svgPath, svg);
  return `/previews/${slug}.svg`;
}

/** 真的打開 homepageUrl 截首頁圖，失敗就丟出錯誤讓呼叫端 fallback 成佔位圖。 */
async function captureScreenshot(browser, repo, slug) {
  mkdirSync(previewsDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    const response = await page.goto(repo.homepageUrl, { waitUntil: "networkidle", timeout: 20000 });
    if (!response || response.status() >= 400) {
      throw new Error(`http ${response ? response.status() : "no response"}`);
    }
    await page.waitForTimeout(1500);
    const pngPath = path.join(previewsDir, `${slug}.png`);
    await page.screenshot({ path: pngPath });
    return `/previews/${slug}.png`;
  } finally {
    await page.close();
  }
}

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
  .map((repo) => {
    const topics = (repo.repositoryTopics ?? []).map((topic) => topic.name).filter(Boolean);
    const readme = repo.description && topics.length ? "" : fetchReadme(repo.nameWithOwner);
    return {
      name: repo.name,
      nameWithOwner: repo.nameWithOwner,
      description: repo.description || extractSummary(readme),
      visibility: repo.visibility,
      isPrivate: Boolean(repo.isPrivate),
      createdAt: repo.createdAt,
      updatedAt: repo.updatedAt,
      primaryLanguage: repo.primaryLanguage?.name ?? null,
      topics,
      readmeFeatures: topics.length ? [] : extractFeatures(readme),
      homepageUrl: repo.homepageUrl ?? "",
      url: repo.url,
      isArchived: Boolean(repo.isArchived),
      isFork: Boolean(repo.isFork),
      stargazerCount: repo.stargazerCount ?? 0,
      forkCount: repo.forkCount ?? 0,
    };
  })
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

writeFileSync(outputPath, `${JSON.stringify(repos, null, 2)}\n`);

console.log(`Synced ${repos.length} repositories to ${path.relative(root, outputPath)}`);

// ---------------------------------------------------------------------------
// 補齊 preview-manifest：新 repo 有 homepageUrl 就真的截首頁圖，
// 沒有網址或截圖失敗就退回佔位卡片，確保永遠不會出現破圖或空白預覽。
// ---------------------------------------------------------------------------

let previewManifest = {};
try {
  previewManifest = JSON.parse(readFileSync(previewManifestPath, "utf8"));
} catch {
  // 檔案不存在就從空的開始
}

let overridesForPreview = {};
try {
  overridesForPreview = JSON.parse(readFileSync(path.join(dataDir, "project-overrides.json"), "utf8"));
} catch {
  // 沒有 overrides 也能跑
}

const hasOverridePreview = (repo) => Boolean(overridesForPreview[repo.name]?.previewPath);
const isCaptured = (repo) => previewManifest[repo.name]?.status === "captured";
const hasManifestEntry = (repo) => Boolean(previewManifest[repo.name]);

let capturedCount = 0;
let placeholderCount = 0;

// 有 homepageUrl 但還沒截到真實畫面的（含新 repo、之前失敗過的），每天都值得重試一次。
const captureCandidates = repos.filter(
  (repo) => !hasOverridePreview(repo) && repo.homepageUrl && !isCaptured(repo),
);
if (captureCandidates.length > 0) {
  const browser = await chromium.launch();
  for (const repo of captureCandidates) {
    const slug = slugify(repo.name);
    try {
      const relativePath = await captureScreenshot(browser, repo, slug);
      previewManifest[repo.name] = { status: "captured", source: repo.homepageUrl, path: relativePath };
      capturedCount += 1;
      console.log(`Captured screenshot for ${repo.name}`);
    } catch (err) {
      const relativePath = writePlaceholderSvg(repo, slug);
      previewManifest[repo.name] = { status: "fallback", reason: err.message, path: relativePath };
      placeholderCount += 1;
      console.warn(`Falling back to placeholder for ${repo.name}: ${err.message}`);
    }
  }
  await browser.close();
}

// 沒有 homepageUrl 的話沒東西可截，只在完全沒有紀錄的新 repo 補一張佔位卡片，
// 已經是 fallback 狀態的既有 repo 不重複改寫。
for (const repo of repos.filter((repo) => !hasOverridePreview(repo) && !repo.homepageUrl && !hasManifestEntry(repo))) {
  const slug = slugify(repo.name);
  const relativePath = writePlaceholderSvg(repo, slug);
  previewManifest[repo.name] = { status: "fallback", reason: "missing homepageUrl", path: relativePath };
  placeholderCount += 1;
}

if (capturedCount + placeholderCount > 0) {
  writeFileSync(previewManifestPath, `${JSON.stringify(previewManifest, null, 2)}\n`);
  console.log(`Preview sync: ${capturedCount} captured, ${placeholderCount} placeholder`);
}

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
