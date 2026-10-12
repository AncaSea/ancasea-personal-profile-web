"use client";

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
  { id: "guestbook", label: "Guestbook" },
];

export default function SectionNavigation() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      let currentActiveId = "hero";
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollY >= top - windowHeight / 3) {
            currentActiveId = id;
          }
        }
      });
      setActiveSection(currentActiveId);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 p-2">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="group relative flex items-center justify-center w-6 h-6 focus:outline-none"
          aria-label={`Scroll to ${label}`}
        >
          {/* Tooltip */}
          <span className="absolute right-8 px-2.5 py-1 rounded-md bg-popover/90 backdrop-blur-md text-popover-foreground text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-border shadow-md">
            {label}
          </span>
          
          {/* Dot */}
          <div 
            className={cn(
              "rounded-full transition-all duration-300 ease-out",
              activeSection === id 
                ? "bg-primary w-2.5 h-7 shadow-[0_0_12px_var(--color-primary)] ring-2 ring-primary/30" 
                : "bg-muted-foreground/30 w-2 h-2 hover:bg-primary/80 hover:w-2.5 hover:h-2.5"
            )}
          />
        </button>
      ))}
    </div>
  );
}
