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
  const [accent, background] = accentFor(repo);
  const title = escapeXml(repo.name);
  const language = escapeXml(repo.primaryLanguage ?? "Product");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="960" viewBox="0 0 1440 960">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${background}"/>
      <stop offset="1" stop-color="#050505"/>
    </linearGradient>
    <radialGradient id="r" cx="75%" cy="20%" r="70%">
      <stop offset="0" stop-color="${accent}" stop-opacity=".45"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1440" height="960" fill="url(#g)"/>
  <rect width="1440" height="960" fill="url(#r)"/>
  <circle cx="1110" cy="300" r="240" fill="${accent}" opacity=".24"/>
  <circle cx="1040" cy="320" r="124" fill="${accent}" opacity=".32"/>
  <path d="M120 700 C 360 520, 560 760, 820 590 S 1180 430, 1320 590" fill="none" stroke="${accent}" stroke-width="5" opacity=".65"/>
  <path d="M120 760 C 380 640, 620 820, 920 690 S 1160 560, 1320 660" fill="none" stroke="#ffffff" stroke-width="2" opacity=".18"/>
  <rect x="120" y="132" width="1200" height="696" rx="42" fill="#ffffff" opacity=".075" stroke="#ffffff" stroke-opacity=".2"/>
  <rect x="170" y="182" width="250" height="52" rx="26" fill="${accent}" opacity=".22"/>
  <text x="198" y="216" fill="${accent}" font-family="Arial, sans-serif" font-size="24" letter-spacing="5">${language.toUpperCase()}</text>
  <text x="170" y="330" fill="#fff" font-family="Arial, sans-serif" font-size="82" font-weight="700">${title}</text>
  <text x="170" y="420" fill="#e4e4e7" font-family="Arial, sans-serif" font-size="34">Product case preview</text>
  <circle cx="1210" cy="230" r="44" fill="${accent}" opacity=".9"/>
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
    await page.goto(homepageUrl, { waitUntil: "networkidle", timeout: 30000 });
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
