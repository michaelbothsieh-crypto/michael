import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const overridesPath = path.join(root, "src", "data", "project-overrides.json");
const validCategories = new Set([
  "Financial Intelligence",
  "AI Automation",
  "Product Utilities",
  "Business Sites",
  "Data & Research",
  "Experiments",
]);

function readOverrides() {
  return JSON.parse(readFileSync(overridesPath, "utf8"));
}

function writeOverrides(overrides) {
  const ordered = Object.fromEntries(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(overridesPath, `${JSON.stringify(ordered, null, 2)}\n`);
}

function parseArgs(argv) {
  const [command, name, ...rest] = argv;
  const flags = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = rest[index + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      index += 1;
    }
  }

  return { command, name, flags };
}

function parseList(value) {
  if (!value) return undefined;
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requireName(name, command) {
  if (!name) {
    throw new Error(`Usage: npm run projects -- ${command} <repo-name>`);
  }
}

function listProjects(overrides) {
  return Object.entries(overrides)
    .map(([name, override]) => ({
      name,
      category: override.category,
      featured: override.featured,
      sortWeight: override.sortWeight,
      title: override.title?.zh ?? name,
    }))
    .sort((a, b) => b.sortWeight - a.sortWeight || a.name.localeCompare(b.name));
}

function buildOverride(existing, flags) {
  const next = structuredClone(existing ?? {});

  if (flags.category) {
    if (!validCategories.has(flags.category)) {
      throw new Error(`Invalid category: ${flags.category}`);
    }
    next.category = flags.category;
  }

  if (flags.featured !== undefined) {
    next.featured = flags.featured === true || flags.featured === "true";
  }

  if (flags["sort-weight"] !== undefined) {
    const sortWeight = Number(flags["sort-weight"]);
    if (!Number.isFinite(sortWeight)) {
      throw new Error(`Invalid sort weight: ${flags["sort-weight"]}`);
    }
    next.sortWeight = sortWeight;
  }

  if (flags["title-zh"] || flags["title-en"]) {
    next.title = {
      zh: flags["title-zh"] ?? next.title?.zh ?? "",
      en: flags["title-en"] ?? next.title?.en ?? "",
    };
  }

  if (flags["summary-zh"] || flags["summary-en"]) {
    next.summary = {
      zh: flags["summary-zh"] ?? next.summary?.zh ?? "",
      en: flags["summary-en"] ?? next.summary?.en ?? "",
    };
  }

  const featuresZh = parseList(flags["features-zh"]);
  const featuresEn = parseList(flags["features-en"]);
  if (featuresZh || featuresEn) {
    next.features = {
      zh: featuresZh ?? next.features?.zh ?? [],
      en: featuresEn ?? next.features?.en ?? [],
    };
  }

  for (const field of ["category", "featured", "sortWeight", "title", "summary", "features"]) {
    if (next[field] === undefined) {
      throw new Error(`Missing required override field: ${field}`);
    }
  }

  return next;
}

function printHelp() {
  console.log(`Project override CRUD

Commands:
  npm run projects -- list
  npm run projects -- get <repo-name>
  npm run projects -- upsert <repo-name> --category "AI Automation" --featured true --sort-weight 120 \\
    --title-zh "..." --title-en "..." \\
    --summary-zh "..." --summary-en "..." \\
    --features-zh "A|B|C" --features-en "A|B|C"
  npm run projects -- delete <repo-name>

Notes:
  - This edits src/data/project-overrides.json only.
  - Generated GitHub metadata stays owned by npm run sync:repos.
`);
}

const { command, name, flags } = parseArgs(process.argv.slice(2));
const overrides = readOverrides();

try {
  switch (command) {
    case "list":
      console.log(JSON.stringify(listProjects(overrides), null, 2));
      break;
    case "get":
      requireName(name, "get");
      if (!overrides[name]) throw new Error(`No override found for ${name}`);
      console.log(JSON.stringify(overrides[name], null, 2));
      break;
    case "upsert":
      requireName(name, "upsert");
      overrides[name] = buildOverride(overrides[name], flags);
      writeOverrides(overrides);
      console.log(`Upserted ${name}`);
      break;
    case "delete":
      requireName(name, "delete");
      if (!overrides[name]) throw new Error(`No override found for ${name}`);
      delete overrides[name];
      writeOverrides(overrides);
      console.log(`Deleted ${name}`);
      break;
    default:
      printHelp();
      if (command) process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
