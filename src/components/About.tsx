"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import type { Experience, Education, Skill } from "@prisma/client";
import { GridDistortion } from "./canvas/GridDistortion";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Briefcase, GraduationCap, Cpu, Calendar, Building, ChevronRight } from "lucide-react";

interface AboutProps {
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
}

export function About({ experiences, education, skills }: AboutProps) {
  const [activeTab, setActiveTab] = useState<"experience" | "education" | "arsenal">("experience");
  const [activeExp, setActiveExp] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const companyListRef = useRef<HTMLDivElement>(null);

  // Parallax smooth transforms
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const yContent = useTransform(scrollYProgress, [0, 1], [20, -20]);

  // Momentum scroll state for company list
  const companyVelocityRef = useRef(0);
  const companyRafRef = useRef<number | null>(null);

  const runCompanyMomentum = useCallback(() => {
    const el = companyListRef.current;
    if (!el) return;
    if (Math.abs(companyVelocityRef.current) < 0.5) {
      companyVelocityRef.current = 0;
      companyRafRef.current = null;
      return;
    }
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      el.scrollLeft += companyVelocityRef.current;
    } else {
      el.scrollTop += companyVelocityRef.current;
    }
    companyVelocityRef.current *= 0.88;
    companyRafRef.current = requestAnimationFrame(runCompanyMomentum);
  }, []);

  // Native wheel handler — works for both horizontal (mobile) and vertical (desktop) scroll
  const handleCompanyWheel = useCallback((e: WheelEvent) => {
    const el = companyListRef.current;
    if (!el) return;
    const isMobile = window.innerWidth < 768;
    const hasHorizontalOverflow = el.scrollWidth > el.clientWidth;
    const hasVerticalOverflow = el.scrollHeight > el.clientHeight;
    if ((isMobile && hasHorizontalOverflow) || (!isMobile && hasVerticalOverflow)) {
      e.preventDefault();
      e.stopPropagation();
      companyVelocityRef.current += (e.deltaY + e.deltaX) * 0.6;
      companyVelocityRef.current = Math.max(-60, Math.min(60, companyVelocityRef.current));
      if (!companyRafRef.current) {
        companyRafRef.current = requestAnimationFrame(runCompanyMomentum);
      }
    }
  }, [runCompanyMomentum]);

  // Ref callback: attaches listener the moment the company list mounts
  const setCompanyListRef = useCallback((node: HTMLDivElement | null) => {
    if (companyListRef.current) {
      companyListRef.current.removeEventListener('wheel', handleCompanyWheel);
    }
    companyListRef.current = node;
    if (node) {
      node.addEventListener('wheel', handleCompanyWheel, { passive: false });
    }
  }, [handleCompanyWheel]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (companyRafRef.current) cancelAnimationFrame(companyRafRef.current);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-background px-4 sm:px-6 md:px-10 py-16 sm:py-24 border-t border-border/40"
    >
      {/* Background Canvas with Parallax Shift */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none">
        <GridDistortion />
      </motion.div>

      {/* Ambient Floating Glow Orbs */}
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [-60, 60]) }}
        className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        style={{ y: useTransform(scrollYProgress, [0, 1], [60, -60]) }}
        className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" 
      />

      <motion.div style={{ y: yContent }} className="container mx-auto max-w-5xl relative z-10 w-full flex flex-col justify-center">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-7 shrink-0 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-[11px] font-mono tracking-widest uppercase mb-1.5 shadow-sm">
            <span>Profile & Background</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground mb-1.5 break-words">
            Journey & <span className="text-primary">Arsenal</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed px-2">
            A comprehensive overview of my professional journey, education, and technical toolset.
          </p>

          {/* Segmented Control Tabs - Fully responsive on all mobile screens */}
          <div className="flex justify-center mt-3.5 sm:mt-5 w-full">
            <div className="inline-flex p-1 rounded-2xl bg-card/85 dark:bg-white/5 border border-border/80 dark:border-white/10 backdrop-blur-md shadow-md gap-0.5 sm:gap-1.5 max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab("experience")}
                className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-sm transition-colors duration-300 shrink-0 ${
                  activeTab === "experience" ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "experience" && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-primary/15 border border-primary/40 rounded-xl shadow-[0_0_12px_var(--color-primary)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Briefcase size={13} className="relative z-10" />
                <span className="relative z-10">Experience</span>
                <span className="relative z-10 text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded-full bg-primary/20 text-primary ml-0.5 sm:ml-1">
                  {experiences.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("education")}
                className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-sm transition-colors duration-300 shrink-0 ${
                  activeTab === "education" ? "text-blue-500" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "education" && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-blue-500/15 border border-blue-500/40 rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <GraduationCap size={13} className="relative z-10" />
                <span className="relative z-10">Education</span>
                <span className="relative z-10 text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-500 ml-0.5 sm:ml-1">
                  {education.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("arsenal")}
                className={`relative flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-sm transition-colors duration-300 shrink-0 ${
                  activeTab === "arsenal" ? "text-purple-500" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === "arsenal" && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-purple-500/15 border border-purple-500/40 rounded-xl shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Cpu size={13} className="relative z-10" />
                <span className="relative z-10">Arsenal</span>
                <span className="relative z-10 text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-500 ml-0.5 sm:ml-1">
                  {skills.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="w-full mt-2">
          <AnimatePresence mode="wait">
            {/* 1. EXPERIENCE TAB */}
            {activeTab === "experience" && (
              <motion.div
                key="experience-panel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 items-stretch"
              >
                {/* Left Column: List of Companies */}
                <div 
                  ref={setCompanyListRef}
                  data-lenis-prevent="true"
                  data-lenis-prevent-wheel="true"
                  className="md:col-span-5 lg:col-span-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar px-1 max-h-[380px] md:max-h-[400px] pb-2 overscroll-contain cursor-grab active:cursor-grabbing"
                >
                  {experiences.map((exp, i) => (
                    <button
                      key={exp.id}
                      onClick={() => setActiveExp(i)}
                      className={`text-left p-2.5 sm:p-3 rounded-xl transition-all duration-300 relative group shrink-0 md:shrink border w-[190px] sm:w-[210px] md:w-full flex items-center justify-between ${
                        activeExp === i
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-md shadow-primary/20"
                          : "bg-card/60 dark:bg-white/5 border-border/80 dark:border-white/10 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                        <span className="text-xs sm:text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                          {exp.company}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate font-medium">
                          {exp.position}
                        </span>
                        <span className="text-[9px] font-mono text-primary/80">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                      <ChevronRight size={13} className={`transition-transform duration-300 ${activeExp === i ? "text-primary translate-x-0.5" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>

                {/* Right Column: Active Experience Detail Card */}
                <div className="md:col-span-7 lg:col-span-8 flex flex-col min-h-[180px]">
                  {experiences[activeExp] && (
                    <motion.div
                      key={activeExp}
                      initial={{ opacity: 0, scale: 0.99 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 sm:p-6 rounded-2xl bg-card/90 dark:bg-white/5 border border-border/80 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-start h-full"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary bg-primary/10 border border-primary/25 px-2.5 py-0.5 rounded-full font-semibold">
                          <Calendar size={11} />
                          {experiences[activeExp].startDate} - {experiences[activeExp].endDate || 'Present'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Building size={11} />
                          {experiences[activeExp].company}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg md:text-xl font-black text-foreground mb-1 tracking-tight shrink-0">
                        {experiences[activeExp].position}
                      </h3>

                      <div className="w-8 h-0.5 bg-primary/60 rounded-full mb-2.5 shrink-0" />

                      <div data-lenis-prevent="true" data-lenis-prevent-wheel="true" className="overflow-y-auto no-scrollbar pr-1 max-h-[220px] overscroll-contain">
                        <p className="text-xs sm:text-sm text-foreground/85 dark:text-gray-300 leading-relaxed whitespace-pre-line break-words">
                          {experiences[activeExp].description}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. EDUCATION TAB */}
            {activeTab === "education" && (
              <motion.div
                key="education-panel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
              >
                {education.length > 0 ? education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 sm:p-5 rounded-xl bg-card/90 dark:bg-white/5 border border-border/80 dark:border-white/10 hover:border-blue-500/50 transition-all duration-300 border-l-4 border-l-blue-500 backdrop-blur-xl shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <span className="inline-block text-[10px] font-mono text-blue-500 bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1.5">
                        {edu.year}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-foreground mb-1 group-hover:text-blue-500 transition-colors">
                        {edu.degree}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1.5 flex items-center gap-1.5">
                      <Building size={12} className="text-blue-500" />
                      {edu.institution}
                    </p>
                  </div>
                )) : (
                  <p className="col-span-2 text-center text-muted-foreground py-6 text-xs">No education records found.</p>
                )}
              </motion.div>
            )}

            {/* 3. ARSENAL (SKILLS) TAB */}
            {activeTab === "arsenal" && (
              <motion.div
                key="arsenal-panel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-6 rounded-2xl bg-card/90 dark:bg-white/5 border border-border/80 dark:border-white/10 backdrop-blur-xl shadow-md"
              >
                <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center max-w-full">
                  {skills.length > 0 ? skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-background/80 dark:bg-white/5 border border-purple-500/25 hover:border-purple-500 hover:bg-purple-500/15 transition-all duration-300 cursor-default text-[11px] sm:text-xs font-bold text-foreground shadow-sm hover:scale-105 break-words"
                    >
                      {skill.name}
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-6 text-xs">No skills found.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
