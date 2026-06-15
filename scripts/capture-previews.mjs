import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const dataPath = path.join(root, "src", "data", "repos.generated.json");
const previewDir = path.join(root, "public", "previews");
const manifestPath = path.join(previewDir, "manifest.json");
const dataManifestPath = path.join(root, "src", "data", "preview-manifest.generated.json");

const repos = JSON.parse(readFileSync(dataPath, "utf8"));
const manifest = {};

mkdirSync(previewDir, { recursive: true });

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function accentFor(repo) {
  const palette = {
    TypeScript: ["#7dd3fc", "#0f172a"],
    JavaScript: ["#fde68a", "#18181b"],
    Python: ["#86efac", "#111827"],
    HTML: ["#fda4af", "#18181b"],
    PHP: ["#c4b5fd", "#111827"],
    "Jupyter Notebook": ["#fdba74", "#1f2937"],
  };
  return palette[repo.primaryLanguage] ?? ["#d1d5db", "#111827"];
}

function fallbackSvg(repo) {
  const [accent] = accentFor(repo);
  const title = escapeXml(repo.name);
  const language = escapeXml(repo.primaryLanguage ?? "Product");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#e9f3ef"/>
    </linearGradient>
    <radialGradient id="r" cx="75%" cy="20%" r="70%">
      <stop offset="0" stop-color="${accent}" stop-opacity=".36"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1440" height="960" fill="url(#g)"/>
  <rect width="1440" height="960" fill="url(#r)"/>
  <rect x="96" y="96" width="1248" height="768" rx="42" fill="#ffffff" stroke="#0f172a" stroke-opacity=".10"/>
  <rect x="150" y="160" width="260" height="52" rx="26" fill="${accent}" opacity=".22"/>
  <text x="180" y="194" fill="#0f172a" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="5">${language.toUpperCase()}</text>
  <text x="150" y="334" fill="#0f172a" font-family="Arial, sans-serif" font-size="82" font-weight="700">${title}</text>
  <text x="150" y="424" fill="#3f3f46" font-family="Arial, sans-serif" font-size="34">No public product screen available</text>
  <path d="M150 670 C 360 520, 610 760, 860 610 S 1160 470, 1280 610" fill="none" stroke="${accent}" stroke-width="7" opacity=".9"/>
  <circle cx="1190" cy="230" r="58" fill="${accent}" opacity=".7"/>
</svg>`;
}

function writeFallback(repo, reason) {
  const slug = slugify(repo.name);
  const filename = `${slug}.svg`;
  writeFileSync(path.join(previewDir, filename), fallbackSvg(repo));
  manifest[repo.name] = {
    status: "fallback",
    reason,
    path: `/previews/${filename}`,
  };
}

async function getPageProblem(page, response) {
  if ((response?.status() ?? 0) >= 400) {
    return `http ${response.status()}`;
  }

  const title = await page.title();
  const bodyText = await page
    .locator("body")
    .innerText({ timeout: 3000 })
    .catch(() => "");
  const sample = `${title} ${bodyText.slice(0, 600)}`;

  if (/404|not_found|not found|deployment_not_found|找不到/i.test(sample)) {
    return "not found page";
  }

  return "";
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
});

for (const repo of repos) {
  const slug = slugify(repo.name);
  const homepageUrl = repo.homepageUrl?.trim();

  if (!homepageUrl) {
    writeFallback(repo, "missing homepageUrl");
    continue;
  }

  try {
    const response = await page.goto(homepageUrl, { waitUntil: "networkidle", timeout: 30000 });
    const problem = await getPageProblem(page, response);
    if (problem) {
      writeFallback(repo, problem);
      console.log(`Fallback ${repo.name}`);
      continue;
    }
    await page.screenshot({
      path: path.join(previewDir, `${slug}.png`),
      fullPage: false,
    });
    manifest[repo.name] = {
      status: "captured",
      source: homepageUrl,
      path: `/previews/${slug}.png`,
    };
    console.log(`Captured ${repo.name}`);
  } catch (error) {
    writeFallback(repo, error instanceof Error ? error.message : "capture failed");
    console.log(`Fallback ${repo.name}`);
  }
}

await browser.close();
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(dataManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Preview manifest written to ${path.relative(root, manifestPath)}`);
