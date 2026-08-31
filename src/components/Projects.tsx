"use client";
import { useState } from "react";
import type { Project } from "@prisma/client";
import { cn } from "@/lib/utils";
import { X, Star } from "lucide-react";
import { MatrixTrail } from "./canvas/MatrixTrail";
import { useRef } from "react";

interface ProjectsProps {
  featuredProjects: Project[];
  regularProjects: Project[];
}

function TiltCard({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max rotation 10deg
    const rotateY = ((x - centerX) / centerX) * 10;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div 
      ref={cardRef}
      className="project-card glass-panel rounded-3xl p-6 hover:border-primary/50 transition-all duration-200 ease-out flex flex-col h-full cursor-pointer"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div style={{ transform: 'translateZ(30px)' }} className="flex flex-col h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export function Projects({ featuredProjects, regularProjects }: ProjectsProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Helper to get Gacha Rarity Colors for Podium
  const getGlowStyle = (rank: number) => {
    if (rank === 1) return { 
      color: "#FFD700", 
      border: "border-[#FFD700]/80 dark:border-[#FFD700]/50 hover:border-[#FFD700]", 
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_0_15px_rgba(255,215,0,0.15)]",
      stars: 5,
      gradient: "from-background via-background/40 to-transparent dark:from-background dark:via-[#FFD700]/10",
      hologram: "from-transparent via-white/40 to-transparent"
    }; // Mythic Gold
    if (rank === 2) return { 
      color: "#b829ea", 
      border: "border-[#b829ea]/80 dark:border-[#b829ea]/50 hover:border-[#b829ea]", 
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_0_15px_rgba(184,41,234,0.15)]",
      stars: 4,
      gradient: "from-background via-background/40 to-transparent dark:from-background dark:via-[#b829ea]/10",
      hologram: "from-transparent via-white/40 to-transparent"
    }; // Epic Purple
    if (rank === 3) return { 
      color: "#00e5ff", 
      border: "border-[#00e5ff]/80 dark:border-[#00e5ff]/50 hover:border-[#00e5ff]", 
      shadow: "shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_0_15px_rgba(0,229,255,0.15)]",
      stars: 3,
      gradient: "from-background via-background/40 to-transparent dark:from-background dark:via-[#00e5ff]/10",
      hologram: "from-transparent via-white/40 to-transparent"
    }; // Rare Blue
    return { color: "", border: "", shadow: "", stars: 0, gradient: "", hologram: "" };
  };

  // Keep original order for mobile, use CSS order for Desktop Podium
  const orderedProjects = [
    featuredProjects[0] ? { project: featuredProjects[0], rank: 1, position: 'center' } : null,
    featuredProjects[1] ? { project: featuredProjects[1], rank: 2, position: 'left' } : null,
    featuredProjects[2] ? { project: featuredProjects[2], rank: 3, position: 'right' } : null,
  ].filter(Boolean);

  return (
    <section id="projects" className="relative z-10 bg-background pt-24 pb-12 overflow-hidden">
      <MatrixTrail />
      {/* Tech Grid Background for the entire section */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* 1. PODIUM FEATURED SECTION */}
      {featuredProjects.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 w-full mb-24">
          <div className="text-center mb-16">
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Featured <span className="text-primary">Masterpieces</span>
            </h3>
            <p className="text-muted-foreground text-lg">Click to reveal details.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-6 md:gap-4 h-auto md:h-[500px]">
            {orderedProjects.map((item) => {
              if (!item) return null;
              const { project, rank, position } = item;
              const glow = getGlowStyle(rank);
              
              const isHovered = hoveredId === project.id;
              const isOthersHovered = hoveredId !== null && hoveredId !== project.id;
              
              // Responsive ordering
              let orderClass = "";
              if (position === 'center') orderClass = "order-1 md:order-2"; // Rank 1: First on mobile, Center on desktop
              if (position === 'left') orderClass = "order-2 md:order-1";   // Rank 2: Second on mobile, Left on desktop
              if (position === 'right') orderClass = "order-3 md:order-3";  // Rank 3: Third on mobile, Right on desktop

              // Base sizing
              const baseWidth = position === 'center' ? "w-full md:w-1/3 h-[300px] md:h-[450px]" : "w-full md:w-1/4 h-[250px] md:h-[350px]";
              
              // Dynamic states based on hover
              let scale = position === 'center' ? "scale-100 md:scale-110" : "scale-100 md:scale-95";
              let zIndex = position === 'center' ? "z-30" : "z-20";
              let opacity = position === 'center' ? "opacity-100" : "opacity-80";

              if (isHovered) {
                scale = "scale-[1.05] md:scale-[1.20]";
                zIndex = "z-50";
                opacity = "opacity-100";
              } else if (isOthersHovered) {
                scale = "scale-95 md:scale-90";
                zIndex = "z-10";
                opacity = "opacity-40";
              }

              return (
                <div 
                  key={project.id} 
                  onClick={() => setActiveProject(project)}
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "relative cursor-pointer rounded-3xl bg-card transition-all duration-500 ease-out transform group overflow-hidden border-2",
                    orderClass, baseWidth, scale, zIndex, opacity,
                    glow.border,
                    isHovered ? glow.hoverShadow : glow.shadow
                  )}
                >
                  {/* Holographic Foil Animation Layer */}
                  <div className={cn(
                    "absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr translate-y-[100%] -translate-x-[100%] group-hover:translate-y-[-100%] group-hover:translate-x-[100%] ease-out",
                    glow.hologram
                  )} style={{ transitionDuration: '1.5s' }}></div>

                  {/* Inner Gradient Vignette / Frame */}
                  <div className={cn("absolute inset-0 z-10 pointer-events-none rounded-3xl border-[4px] opacity-20 mix-blend-overlay", glow.border)}></div>

                  {/* Image Background */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                    {project.imageUrl ? (
                      <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center font-mono text-6xl opacity-30">
                        {project.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Gradient Overlay (Gacha Colored Style) */}
                  <div className={cn("absolute inset-0 bg-gradient-to-t rounded-3xl pointer-events-none", glow.gradient)} />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end z-30">
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="text-xs font-black uppercase tracking-widest transition-all duration-500 drop-shadow-md" 
                        style={{ 
                          color: glow.color,
                          textShadow: isHovered ? "0 0 10px " + glow.color : "0 0 3px " + glow.color + "40"
                        }}
                      >
                        {rank === 1 ? "Mythic Rank" : rank === 2 ? "Epic Rank" : "Rare Rank"}
                      </span>

                    </div>
                    <h4 
                      className="text-2xl md:text-3xl font-black line-clamp-2 transition-all duration-500 text-foreground"
                      style={{ textShadow: isHovered ? "0 0 15px " + glow.color + "80" : "none" }}
                    >
                      {project.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MODAL OVERLAY */}
      {activeProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-md" 
            onClick={() => setActiveProject(null)}
          />
          <div className="relative w-full max-w-4xl glass-panel bg-card/90 rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col md:flex-row h-[80vh] md:h-[60vh] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveProject(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-1/2 h-48 md:h-full bg-muted relative">
              {activeProject.imageUrl ? (
                <img src={activeProject.imageUrl} alt={activeProject.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-mono text-6xl opacity-30">
                  {activeProject.title.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 p-8 overflow-y-auto flex flex-col">
              <h3 className="text-3xl font-black mb-4">{activeProject.title}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {activeProject.description}
              </p>
              
              <div className="mb-8">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    let stack: string[] = [];
                    try {
                      stack = Array.isArray(activeProject.techStack) ? activeProject.techStack as string[] : JSON.parse(activeProject.techStack as string);
                    } catch(e) {}
                    return stack.map((tech, j) => (
                      <span key={j} className="text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-md font-mono">
                        {tech}
                      </span>
                    ));
                  })()}
                </div>
              </div>

              {activeProject.link && (
                <a 
                  href={activeProject.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-auto block w-full py-4 bg-primary text-primary-foreground text-center rounded-xl font-bold hover:scale-[1.02] transition-transform"
                >
                  Visit Project
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. REGULAR GRID SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-24">
        <h3 className="text-3xl md:text-5xl font-black mb-16 tracking-tighter">
          Latest <span className="text-primary">Experiments</span>
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {regularProjects.length > 0 ? regularProjects.map((project, i) => {
            let stack: string[] = [];
            try {
              if (project.techStack) {
                stack = Array.isArray(project.techStack) 
                  ? project.techStack as string[]
                  : JSON.parse(project.techStack as string);
              }
            } catch (e) {}

            return (
              <TiltCard key={project.id} onClick={() => setActiveProject(project)}>
                <h4 className="text-2xl font-bold mb-3">{project.title}</h4>
                <p className="text-muted-foreground mb-6 line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                  {stack.slice(0, 3).map((tech, j) => (
                    <span key={j} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md font-mono pointer-events-auto">
                      {tech}
                    </span>
                  ))}
                  {stack.length > 3 && <span className="text-xs px-2 py-1 bg-primary/5 text-primary/50 rounded-md pointer-events-auto">+{stack.length - 3}</span>}
                </div>
              </TiltCard>
            );
          }) : <p className="text-muted-foreground text-center col-span-full">No projects found.</p>}
        </div>

        <div className="flex justify-center mt-16">
          <a href="/projects" className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform shadow-xl hover:shadow-[0_0_30px_var(--color-primary)]">
            View All Archive
          </a>
        </div>
      </div>
    </section>
  );
}