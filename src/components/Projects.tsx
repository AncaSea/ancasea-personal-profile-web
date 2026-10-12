"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type { Project } from "@prisma/client";
import { TerminalGrid } from "./canvas/TerminalGrid";
import { ExternalLink, Star, X, Sparkles, Beaker, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

interface ProjectsProps {
  featuredProjects: Project[];
  regularProjects: Project[];
}

export function Projects({ featuredProjects, regularProjects }: ProjectsProps) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectTab, setProjectTab] = useState<"featured" | "experiments">("featured");
  
  const sectionRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const experimentsRef = useRef<HTMLDivElement>(null);
  const carouselRef = featuredRef; // kept for scrollCarousel button compat

  // Smooth horizontal scroll state (shared across carousels)
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const activeCarouselRef = useRef<HTMLDivElement | null>(null);

  // Parallax smooth transforms
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const yContent = useTransform(scrollYProgress, [0, 1], [25, -25]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = projectTab === 'featured' ? featuredRef.current : experimentsRef.current;
    if (el) {
      const scrollAmount = Math.min(window.innerWidth * 0.65, 450);
      el.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Momentum-based smooth horizontal scroll using RAF
  const runMomentum = useCallback(() => {
    const el = activeCarouselRef.current;
    if (!el) return;
    if (Math.abs(velocityRef.current) < 0.5) {
      velocityRef.current = 0;
      rafRef.current = null;
      return;
    }
    el.scrollLeft += velocityRef.current;
    velocityRef.current *= 0.88; // exponential decay — lower = smoother/slower
    rafRef.current = requestAnimationFrame(runMomentum);
  }, []);

  // Wheel handler: accumulates velocity, starts RAF loop
  const handleCarouselWheel = useCallback((e: WheelEvent) => {
    const el = (e.currentTarget as HTMLDivElement);
    if (!el || el.scrollWidth <= el.clientWidth) return;
    e.preventDefault();
    e.stopPropagation();
    activeCarouselRef.current = el;
    // Add wheel delta to velocity
    velocityRef.current += (e.deltaY + e.deltaX) * 0.6;
    // Clamp velocity to avoid too fast scroll
    velocityRef.current = Math.max(-80, Math.min(80, velocityRef.current));
    // Start RAF if not already running
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(runMomentum);
    }
  }, [runMomentum]);

  // Ref callbacks: attach/detach wheel listener the INSTANT a carousel mounts/unmounts.
  // This is more reliable than useEffect for AnimatePresence-controlled elements,
  // because the ref callback fires synchronously when the DOM node appears.
  const setFeaturedRef = useCallback((node: HTMLDivElement | null) => {
    if (featuredRef.current) {
      featuredRef.current.removeEventListener('wheel', handleCarouselWheel);
    }
    featuredRef.current = node;
    if (node) {
      node.addEventListener('wheel', handleCarouselWheel, { passive: false });
    }
  }, [handleCarouselWheel]);

  const setExperimentsRef = useCallback((node: HTMLDivElement | null) => {
    if (experimentsRef.current) {
      experimentsRef.current.removeEventListener('wheel', handleCarouselWheel);
    }
    experimentsRef.current = node;
    if (node) {
      node.addEventListener('wheel', handleCarouselWheel, { passive: false });
    }
  }, [handleCarouselWheel]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="projects" 
      className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-background px-4 sm:px-6 md:px-10 py-20 sm:py-28 border-t border-border/40"
    >
      {/* Background Canvas with Parallax Shift */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none">
        <TerminalGrid />
      </motion.div>

      {/* Ambient Floating Glow Orbs for Optical Depth */}
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [-70, 70]) }}
        className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [70, -70]) }}
        className="absolute bottom-1/3 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" 
      />
      
      <motion.div style={{ y: yContent }} className="container mx-auto max-w-5xl relative z-10 w-full flex flex-col justify-center">
        {/* Header with Sub-tabs: Featured vs Experiments */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-mono tracking-widest uppercase mb-2">
              <span>Showcase & Work</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
              Selected <span className="text-primary">Projects</span>
            </h2>
          </div>

          {/* Sub-tab Switcher: Featured vs Experiments */}
          <div className="flex items-center gap-3">
            <div className="inline-flex p-1 rounded-2xl bg-card/85 dark:bg-white/5 border border-border/80 dark:border-white/10 backdrop-blur-md shadow-md gap-1">
              <button
                onClick={() => setProjectTab("featured")}
                className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors duration-300 ${
                  projectTab === "featured" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {projectTab === "featured" && (
                  <motion.div
                    layoutId="projectTabBadge"
                    className="absolute inset-0 bg-primary/15 border border-primary/40 rounded-xl shadow-[0_0_12px_var(--color-primary)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Sparkles size={14} className="relative z-10" />
                <span className="relative z-10">Featured ({featuredProjects.length})</span>
              </button>

              <button
                onClick={() => setProjectTab("experiments")}
                className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors duration-300 ${
                  projectTab === "experiments" ? "text-purple-500" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {projectTab === "experiments" && (
                  <motion.div
                    layoutId="projectTabBadge"
                    className="absolute inset-0 bg-purple-500/15 border border-purple-500/40 rounded-xl shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Beaker size={14} className="relative z-10" />
                <span className="relative z-10">Experiments ({regularProjects.length})</span>
              </button>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-1.5">
              <button 
                onClick={() => scrollCarousel('left')} 
                aria-label="Scroll left"
                className="p-2 rounded-full bg-card/90 dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-all border border-border dark:border-white/10 text-foreground shadow-sm hover:scale-105 active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scrollCarousel('right')} 
                aria-label="Scroll right"
                className="p-2 rounded-full bg-card/90 dark:bg-white/5 hover:bg-accent dark:hover:bg-white/10 transition-all border border-border dark:border-white/10 text-foreground shadow-sm hover:scale-105 active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Carousel Display */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {/* VIEW 1: FEATURED MASTERPIECES */}
            {projectTab === "featured" && (
              <motion.div
                key="featured-carousel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                ref={setFeaturedRef} data-lenis-prevent="true" data-lenis-prevent-wheel="true" className="w-full overflow-x-auto no-scrollbar flex gap-4 sm:gap-5 items-stretch py-2 overscroll-x-contain cursor-grab active:cursor-grabbing"
              >
                {featuredProjects.map(project => (
                  <div 
                    key={project.id} 
                    onClick={() => setActiveProject(project)}
                    className="shrink-0 w-[85vw] sm:w-[62vw] md:w-[48vw] lg:w-[42vw] max-w-[500px] cursor-pointer group"
                  >
                    <div className="h-[270px] sm:h-[285px] rounded-2xl overflow-hidden border border-border/80 dark:border-white/10 bg-card/90 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col sm:flex-row group-hover:-translate-y-1">
                      {/* Image Thumbnail */}
                      <div className="w-full sm:w-[46%] h-36 sm:h-auto relative overflow-hidden bg-muted shrink-0">
                        {project.imageUrl ? (
                          <img 
                            src={project.imageUrl} 
                            alt={project.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/5 flex items-center justify-center text-4xl font-black text-primary/30">
                            {project.title.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-background/90 via-transparent to-transparent opacity-70" />
                      </div>
                      
                      {/* Details */}
                      <div className="w-full sm:w-[54%] p-4 sm:p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            {project.language && (
                              <span className="text-[10px] font-mono bg-muted dark:bg-white/10 text-muted-foreground px-2 py-0.5 rounded-md border border-border dark:border-white/20 font-semibold">
                                {project.language}
                              </span>
                            )}
                            {project.stars !== undefined && project.stars > 0 && (
                              <span className="flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-500 font-bold px-2 py-0.5 rounded-md border border-yellow-500/20">
                                <Star className="w-2.5 h-2.5 fill-yellow-500" />
                                {project.stars}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
                            {project.title}
                          </h3>
                          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                            {project.description || "Click to see more details about this masterpiece."}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center gap-1.5 text-xs font-bold text-primary">
                          <span>Explore Project</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* VIEW 2: LATEST EXPERIMENTS */}
            {projectTab === "experiments" && (
              <motion.div
                key="experiments-carousel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                ref={setExperimentsRef} data-lenis-prevent="true" data-lenis-prevent-wheel="true" className="w-full overflow-x-auto no-scrollbar flex gap-4 items-stretch py-2 overscroll-x-contain cursor-grab active:cursor-grabbing"
              >
                {regularProjects.map(project => {
                  let stack: string[] = [];
                  try {
                    if (project.techStack) {
                      stack = Array.isArray(project.techStack) ? project.techStack as string[] : JSON.parse(project.techStack as string);
                    }
                  } catch (e) {}

                  return (
                    <div 
                      key={project.id} 
                      onClick={() => setActiveProject(project)}
                      className="shrink-0 w-[70vw] sm:w-[42vw] md:w-[30vw] lg:w-[22vw] max-w-[280px] cursor-pointer group"
                    >
                      <div className="h-[240px] sm:h-[255px] p-4 sm:p-4.5 rounded-2xl bg-card/90 dark:bg-white/5 border border-border/80 dark:border-white/10 hover:border-purple-500/50 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between group-hover:-translate-y-1">
                        <div>
                          <span className="text-[10px] font-mono text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 mb-2 inline-block font-semibold">
                            Repository
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold line-clamp-1 text-foreground group-hover:text-purple-500 transition-colors mb-1.5">
                            {project.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                            {project.description || "Experimental repository and playground project."}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-border/40 flex flex-wrap gap-1">
                          {stack.slice(0, 3).map((tech, j) => (
                            <span key={j} className="text-[9px] px-1.5 py-0.5 bg-muted dark:bg-white/10 text-muted-foreground rounded font-mono font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* View All Archive Card */}
                <div className="shrink-0 w-[45vw] sm:w-[28vw] md:w-[18vw] max-w-[220px] h-[240px] sm:h-[255px] flex items-center justify-center">
                  <a 
                    href="/projects" 
                    className="w-full h-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary font-bold flex flex-col items-center justify-center gap-2 group transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight size={16} />
                    </div>
                    <span className="text-xs text-center">View All Archive</span>
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
