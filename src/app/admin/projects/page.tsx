import { prisma } from "@/utils/prisma";
import { ProjectList } from "./ProjectList";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 p-4 max-w-4xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-mono text-primary">Manage Projects</h1>
      </div>
      <p className="text-muted-foreground">
        Toggle which projects should be featured on your landing page. You can also assign images to them since CV parsing only extracts text.
      </p>
      
      <ProjectList initialProjects={projects} />
    </div>
  );
}