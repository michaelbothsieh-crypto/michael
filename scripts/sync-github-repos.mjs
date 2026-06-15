import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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

mkdirSync(dataDir, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(repos, null, 2)}\n`);

console.log(`Synced ${repos.length} repositories to ${path.relative(root, outputPath)}`);
