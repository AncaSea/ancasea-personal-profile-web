"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import type { Project } from "@prisma/client";

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".project-card");
      
      cards.forEach(card => {
        card.addEventListener("mousemove", (e: any) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          
          gsap.to(card, {
            rotationY: x * 20,
            rotationX: -y * 20,
            transformPerspective: 1000,
            ease: "power2.out",
          });
        });
        
        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            ease: "power2.out",
          });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [projects]);

  return (
    <section className="py-24 px-4 min-h-screen relative z-10" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        <h3 className="text-4xl md:text-7xl font-black mb-16 text-center tracking-tighter">
          Featured <span className="text-primary">Works</span>
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {projects.length > 0 ? projects.map((project, i) => {
            // Parse techStack assuming it's stored as JSON array of strings
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
                className="project-card glass-panel rounded-3xl p-6 cursor-pointer transform-style-3d group hover:border-primary/50 transition-colors"
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
                  {stack.slice(0, 4).map((tech, j) => (
                    <span key={j} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-mono">
                      {tech}
                    </span>
                  ))}
                  {stack.length > 4 && <span className="text-xs px-2 py-1 bg-primary/5 text-primary/50 rounded-md">+{stack.length - 4}</span>}
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
    </section>
  );
}