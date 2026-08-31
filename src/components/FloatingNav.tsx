"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
];

export function FloatingNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      let currentActiveId = "hero";
      sections.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const offsetTop = el.offsetTop;
          if (scrollY >= offsetTop - windowHeight / 2) {
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
    <div className="fixed top-1/2 -translate-y-1/2 right-4 sm:hidden z-[100] flex flex-col items-center gap-4">
      

      {/* Bubble Navigation */}
      <div className="flex flex-col gap-3 p-3 rounded-full bg-background/30 backdrop-blur-md border border-border shadow-lg flex">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeSection === id
                ? "bg-primary scale-125 shadow-[0_0_10px_var(--color-primary)]"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            }`}
            aria-label={`Scroll to ${label}`}
            title={label}
          />
        ))}
      </div>
    </div>
  );
}