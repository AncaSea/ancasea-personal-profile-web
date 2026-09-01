"use client"

import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

export default function SectionNavigation() {
  const [sections, setSections] = useState<HTMLElement[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    // Find all sections on the page
    const sectionElements = Array.from(document.querySelectorAll('main > section')) as HTMLElement[]
    setSections(sectionElements)

    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight

      // Determine which section is currently most visible
      let currentActiveIndex = 0
      sectionElements.forEach((section, index) => {
        const offsetTop = section.offsetTop
        // If the top of the section is above the middle of the screen
        if (scrollY >= offsetTop - windowHeight / 2) {
          currentActiveIndex = index
        }
      })
      setActiveIndex(currentActiveIndex)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (index: number) => {
    if (sections[index]) {
      window.scrollTo({
        top: sections[index].offsetTop,
        behavior: "smooth"
      })
    }
  }

  if (sections.length <= 1) return null;

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 p-2 hidden sm:flex">
      {sections.map((_, index) => (
        <button
          key={index}
          onClick={() => scrollToSection(index)}
          className="group relative flex items-center justify-center w-8 h-8 focus:outline-none"
          aria-label={`Scroll to section ${index + 1}`}
        >
          {/* Tooltip */}
          <span className="absolute right-10 px-3 py-1 rounded-md bg-popover/80 backdrop-blur-md text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-border">
            Section {index + 1}
          </span>
          
          {/* Dot */}
          <div 
            className={cn(
              "rounded-full transition-all duration-500 ease-out",
              activeIndex === index 
                ? "bg-primary w-3 h-10 shadow-[0_0_15px_var(--color-primary)]" 
                : "bg-muted-foreground/30 w-2 h-2 hover:bg-primary/80 hover:w-3 hover:h-3"
            )}
          />
        </button>
      ))}
    </div>
  )
}