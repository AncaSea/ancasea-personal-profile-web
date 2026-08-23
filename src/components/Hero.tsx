"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProfileInfo } from "@prisma/client";

gsap.registerPlugin(ScrollTrigger);

export function Hero({ profile }: { profile: ProfileInfo | null }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.from(textRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (clickCount >= 3) {
      window.location.href = '/login';
    }
  }, [clickCount]);

  const name = profile?.name || "Creative Developer";
  const tagline = profile?.tagline || "Building Digital Experiences";

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden perspective-1000">
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover bg-center opacity-20"
      />
      
      <div className="relative z-10 text-center px-4" ref={textRef}>
        <h2 className="text-xl md:text-2xl text-primary font-mono mb-4 tracking-wider uppercase">
          Hello, I'm
        </h2>
        <h1 
          onClick={() => setClickCount(prev => prev + 1)}
          className="text-5xl md:text-8xl font-black mb-6 tracking-tighter mix-blend-difference text-foreground cursor-default select-none"
        >
          {name}
        </h1>
        <p className="text-xl md:text-3xl text-muted-foreground font-light max-w-2xl mx-auto">
          {tagline}
        </p>
        
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <button className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform glass-panel">
            View Projects
          </button>
          <button className="px-8 py-4 border border-primary/20 rounded-full font-bold hover:bg-primary/10 transition-colors backdrop-blur-md">
            Contact Me
          </button>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
    </section>
  );
}