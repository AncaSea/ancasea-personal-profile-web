import { prisma } from "@/utils/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

export default async function AllProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="min-h-screen py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center text-primary hover:underline mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
            All <span className="text-primary">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
            A complete archive of everything I've built, experimented with, and launched.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.length > 0 ? projects.map((project, i) => {
            let stack: string[] = [];
            try {
              if (project.techStack) {
                stack = Array.isArray(project.techStack) 
                  ? project.techStack as string[]
                  : JSON.parse(project.techStack as string);
              }
            } catch (e) {}

            return (
              <div 
                key={project.id}
                className="glass-panel rounded-3xl p-6 group hover:border-primary/50 transition-colors"
              >
                <div className="h-48 rounded-xl bg-primary/10 mb-6 overflow-hidden relative border border-primary/20">
                   {project.imageUrl ? (
                     <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                   ) : (
                     <div className="absolute inset-0 flex items-center justify-center text-primary/40 font-mono text-4xl font-bold group-hover:scale-110 transition-transform">
                       {project.title.substring(0,2).toUpperCase()}
                     </div>
                   )}
                </div>
                
                <h4 className="text-2xl font-bold mb-3">{project.title}</h4>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {stack.map((tech, j) => (
                    <span key={j} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-mono">
                      {tech}
                    </span>
                  ))}
                </div>

                {project.link && (
                  <a href={project.link} target="_blank" rel="noreferrer" className="inline-block text-sm font-bold uppercase tracking-wider text-primary hover:text-white transition-colors">
                    View Project &rarr;
                  </a>
                )}
              </div>
            );
          }) : <p className="text-muted-foreground text-center col-span-full">No projects found.</p>}
        </div>
      </div>
    </main>
  );
}