"use client";
import { ReactNode, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface HorizontalScrollCardProps {
  children: ReactNode;
  zIndex: number;
}

export function HorizontalScrollCard({ children, zIndex }: HorizontalScrollCardProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  
  // 1. HORIZONTAL SCROLL LOGIC
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: targetRef,
    // Default offset is ["start start", "end end"] which is perfect for driving the horizontal track over the 600vh height
  });

  const x = useTransform(
    horizontalProgress,
    [0, 0.2, 0.45, 0.65, 0.9, 1],
    ["0%", "0%", "-33.33%", "-33.33%", "-66.66%", "-66.66%"]
  );

  // 2. FLIP PARALLAX LOGIC
  // Track when the NEXT card scrolls over THIS card.
  // "end end": The bottom of THIS 600vh card hits the bottom of the viewport (Next card starts appearing).
  // "end start": The bottom of THIS 600vh card hits the top of the viewport (Next card fully covers this card).
  const { scrollYProgress: flipProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"]
  });

  const scale = useTransform(flipProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(flipProgress, [0, 1], [1, 0]);
  const rotateX = useTransform(flipProgress, [0, 1], ["0deg", "-5deg"]);

  return (
    <div ref={targetRef} className="relative w-full h-[600vh] bg-background" style={{ zIndex }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-background [perspective:1000px] border-b border-border/40">
        <motion.div 
          style={{ x, scale, opacity, rotateX }} 
          className="w-[300vw] h-full flex origin-top"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
