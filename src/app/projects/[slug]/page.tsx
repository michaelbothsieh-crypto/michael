import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailExperience } from "@/components/ProjectDetailExperience";
import { getProjectBySlug, getProjects } from "@/lib/projects";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const url = `/projects/${project.slug}`;

  return {
    title: `${project.title.en} | Michael Product Lab`,
    description: project.summary.en,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: project.title.en,
      description: project.summary.en,
      images: [{ url: project.previewPath, alt: `${project.title.en} preview` }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  return <ProjectDetailExperience project={project} />;
}
