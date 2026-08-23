"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ProfileInfo } from "@prisma/client";
import { MagneticButton } from "./MagneticButton";
import { NeuralNetwork } from "./canvas/NeuralNetwork";

gsap.registerPlugin(ScrollTrigger);

export function Hero({ profile }: { profile: ProfileInfo | null }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background Parallax
      gsap.to(bgRef.current, {
        yPercent: 40,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Text Staggered Reveal
      const children = textRef.current?.children || [];
      gsap.fromTo(children, 
        { y: 80, opacity: 0, rotateX: -45 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "back.out(1.7)",
          delay: 0.2,
        }
      );
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
      
      {/* Dual Vibe Dynamic Background */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,var(--color-primary)_0%,transparent_70%)] opacity-[0.15] scale-150 transform transition-colors duration-1000"
      />
      
      {/* Cyberpunk Grid Overlay (Only visible in dark theme) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Canvas Effect */}
      <NeuralNetwork />

      <div className="relative z-10 text-center px-4" ref={textRef}>
        <h2 className="text-xl md:text-2xl text-primary font-bold mb-4 tracking-[0.2em] uppercase drop-shadow-sm">
          Hello, I'm
        </h2>
        
        <h1 
          onClick={() => setClickCount(prev => prev + 1)}
          className="text-6xl md:text-9xl font-black mb-6 tracking-tighter mix-blend-difference text-foreground cursor-default select-none leading-none drop-shadow-xl"
        >
          {name.split(' ').map((word, i) => (
            <span key={i} className="inline-block hover:text-primary transition-colors duration-300 mr-4 last:mr-0">
              {word}
            </span>
          ))}
        </h1>
        
        <p className="text-2xl md:text-4xl text-muted-foreground font-light max-w-3xl mx-auto mb-12 drop-shadow-sm">
          {tagline}
        </p>
        
        <div className="flex flex-wrap justify-center gap-6">
          <MagneticButton onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-primary text-primary-foreground rounded-full font-bold shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_40px_var(--color-primary)] transition-shadow">
            View Projects
          </MagneticButton>
          <MagneticButton className="px-10 py-5 border-2 border-primary/30 rounded-full font-bold hover:bg-primary/10 transition-colors backdrop-blur-sm">
            Contact Me
          </MagneticButton>
        </div>
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
    </section>
  );
}