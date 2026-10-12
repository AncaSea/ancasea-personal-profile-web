"use client";
import { ReactNode, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface StickyCardProps {
  children: ReactNode;
  zIndex: number;
}

export function StickyCard({ children, zIndex }: StickyCardProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.90]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], ["0deg", "-4deg"]);

  return (
    <div 
      ref={targetRef} 
      className="sticky-card-section relative w-full h-screen snap-start snap-always" 
      style={{ zIndex }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-background [perspective:1000px] border-b border-border/40">
        <motion.div 
          style={{ scale, opacity, rotateX }} 
          className="w-full h-full flex items-center justify-center origin-top"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
