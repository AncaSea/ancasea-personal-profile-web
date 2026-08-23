"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Experience, Education, Skill } from "@prisma/client";

gsap.registerPlugin(ScrollTrigger);

interface AboutProps {
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
}

export function About({ experiences, education, skills }: AboutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".about-section");
      
      sections.forEach((section) => {
        gsap.from(section, {
          y: 50,
          opacity: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-24 px-4 min-h-screen bg-background/50 backdrop-blur-sm relative z-10">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Experience Section */}
        <div className="about-section">
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-primary font-mono tracking-tight border-l-4 border-primary pl-6">
            Experience
          </h3>
          <div className="grid gap-8 border-l-2 border-primary/20 ml-8 pl-8 relative">
            {experiences.length > 0 ? experiences.map((exp, i) => (
              <div key={exp.id} className="relative group">
                <div className="absolute -left-[41px] top-2 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary group-hover:scale-125 transition-transform" />
                <div className="glass-panel p-8 rounded-2xl hover:border-primary/50 transition-colors">
                  <span className="text-sm text-primary font-mono bg-primary/10 px-3 py-1 rounded-full mb-4 inline-block">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                  <h4 className="text-2xl font-bold mb-2">{exp.position}</h4>
                  <p className="text-xl text-muted-foreground mb-4">{exp.company}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>
            )) : <p className="text-muted-foreground">No experiences found.</p>}
          </div>
        </div>

        {/* Education Section */}
        <div className="about-section">
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-blue-500 font-mono tracking-tight border-l-4 border-blue-500 pl-6">
            Education
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {education.length > 0 ? education.map((edu, i) => (
              <div key={edu.id} className="glass-panel p-8 rounded-2xl hover:border-blue-500/50 transition-colors border-l-4 border-l-blue-500">
                <span className="text-sm text-blue-500 font-mono mb-4 block">
                  {edu.year}
                </span>
                <h4 className="text-2xl font-bold mb-2">{edu.degree}</h4>
                <p className="text-xl text-muted-foreground">{edu.institution}</p>
              </div>
            )) : <p className="text-muted-foreground">No education found.</p>}
          </div>
        </div>

        {/* Skills Section */}
        <div className="about-section">
          <h3 className="text-3xl md:text-5xl font-bold mb-12 text-purple-500 font-mono tracking-tight border-l-4 border-purple-500 pl-6">
            Tech Arsenal
          </h3>
          <div className="flex flex-wrap gap-4">
            {skills.length > 0 ? skills.map((skill, i) => (
              <div 
                key={skill.id}
                className="px-6 py-3 rounded-full glass-panel border border-purple-500/20 hover:border-purple-500 hover:bg-purple-500/10 transition-all cursor-default text-lg"
              >
                {skill.name}
              </div>
            )) : <p className="text-muted-foreground">No skills found.</p>}
          </div>
        </div>

      </div>
    </section>
  );
}