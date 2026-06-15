import { PortfolioExperience } from "@/components/PortfolioExperience";
import { getProjects } from "@/lib/projects";

export default function Home() {
  const projects = getProjects();

  return <PortfolioExperience projects={projects} />;
}
