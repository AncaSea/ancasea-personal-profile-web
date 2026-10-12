"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
  { id: "guestbook", label: "Guestbook" },
];

export function FloatingNav() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight || 1;
      const index = Math.min(
        sections.length - 1,
        Math.max(0, Math.round(scrollY / windowHeight))
      );
      setActiveIndex(index);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollTo = (index: number) => {
    window.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-4 z-[90] flex flex-col items-center gap-4">
      {/* Bubble Navigation */}
      <div className="flex flex-col gap-3 p-3 rounded-full bg-card/70 dark:bg-black/40 backdrop-blur-md border border-border shadow-lg">
        {sections.map(({ id, label }, i) => (
          <button
            key={id}
            onClick={() => scrollTo(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "bg-primary scale-125 shadow-[0_0_10px_var(--color-primary)] ring-2 ring-primary/40"
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
