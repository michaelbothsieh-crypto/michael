import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();

  return [
    {
      url: "https://michael-lab.dev",
      lastModified: projects[0]?.updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `https://michael-lab.dev/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
