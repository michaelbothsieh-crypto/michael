import { PortfolioExperience } from "@/components/PortfolioExperience";
import { getProjects, toProjectSummary } from "@/lib/projects";

export default function Home() {
  const projects = getProjects().map(toProjectSummary);

  return <PortfolioExperience projects={projects} />;
}
