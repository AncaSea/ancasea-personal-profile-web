"use client";
import { useEffect, useRef } from "react";

export function TerminalGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.offsetWidth || window.innerWidth;
      height = parent?.offsetHeight || window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();

    let isVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    // Mouse tracking with smooth decay
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    let hasMouseMoved = false;

    // Coding characters for the interactive trail
    const chars = "{}</>[]01!=;=>*#$//λ";
    class CodeParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      char: string;
      life: number;
      maxLife: number;
      size: number;

      constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 16;
        this.y = y + (Math.random() - 0.5) * 16;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = 0.4 + Math.random() * 0.7; // fall down gently
        this.char = chars[Math.floor(Math.random() * chars.length)];
        this.life = 0;
        this.maxLife = Math.random() * 45 + 35;
        this.size = Math.random() > 0.7 ? 13 : 11;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life += 1;
      }

      draw(c: CanvasRenderingContext2D) {
        const progress = this.life / this.maxLife;
        const opacity = Math.max(0, 1 - progress) * 0.85;
        c.fillStyle = `rgba(0, 229, 255, ${opacity})`;
        c.font = `600 ${this.size}px monospace`;
        c.fillText(this.char, this.x, this.y);
      }
    }

    let particles: CodeParticle[] = [];

    // Subtle IDE watermark code snippets
    const codeSnippets = [
      { text: "01 // SYSTEM_BUILD: v2.4.0 [PRODUCTION]", relX: 0.04, relY: 0.08 },
      { text: "02 const showcase = await loadProjects({ featured: true });", relX: 0.04, relY: 0.12 },
      { text: "03 function renderExperiment(lab) => lab.compile()", relX: 0.04, relY: 0.16 },
      { text: "04 [GIT: main] 14 commits ahead of origin/develop", relX: 0.62, relY: 0.08 },
      { text: "05 export default async function Page() { /* ... */ }", relX: 0.62, relY: 0.12 },
      { text: "06 status: 200 OK | latency: 9ms | memory: optimal", relX: 0.62, relY: 0.16 },
      { text: "{ status: 'ACTIVE', runtime: 'EDGE_WORKER' }", relX: 0.04, relY: 0.88 },
      { text: "// EOF: All modules compiled cleanly", relX: 0.62, relY: 0.88 },
    ];

    const GRID_SPACING = 36;
    let animId: number;

    const animate = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(animate);
        return;
      }

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // 1. DRAW SUBTLE IDE BLUEPRINT GRID & CROSSHAIRS
      const startX = 0;
      const startY = 0;
      const mouseRadius = 140;

      for (let x = startX; x < width; x += GRID_SPACING) {
        for (let y = startY; y < height; y += GRID_SPACING) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let alpha = 0.045; // Base subtle opacity
          let isNear = false;

          if (hasMouseMoved && dist < mouseRadius) {
            const proximity = 1 - dist / mouseRadius;
            alpha = 0.045 + proximity * 0.45; // Glow up near cursor
            isNear = true;
          }

          // Draw subtle crosshair '+' at grid points
          const crossSize = isNear ? 3.5 : 2;
          ctx.strokeStyle = isNear ? `rgba(0, 229, 255, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
      }

      // 2. DRAW SUBTLE IDE WATERMARK CODE SNIPPETS
      ctx.font = "11px monospace";
      for (const snippet of codeSnippets) {
        const posX = width * snippet.relX;
        const posY = height * snippet.relY;

        // Proximity glow to watermark text
        const dx = posX - mouse.x;
        const dy = posY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let textAlpha = 0.04; // very subtle base watermark

        if (hasMouseMoved && dist < 180) {
          const prox = 1 - dist / 180;
          textAlpha = 0.04 + prox * 0.18;
          ctx.fillStyle = `rgba(0, 229, 255, ${textAlpha})`;
        } else {
          ctx.fillStyle = `rgba(148, 163, 184, ${textAlpha})`; // slate-400 tint
        }

        ctx.fillText(snippet.text, posX, posY);
      }

      // 3. DRAW & UPDATE CODING CURSOR PARTICLES
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
      }

      // Cleanup expired particles
      particles = particles.filter((p) => p.life < p.maxLife);

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.targetX = clientX;
      mouse.targetY = clientY;
      hasMouseMoved = true;

      // Spawn code particles on movement
      particles.push(new CodeParticle(clientX, clientY));
      if (Math.random() > 0.4) {
        particles.push(new CodeParticle(clientX, clientY));
      }
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      hasMouseMoved = false;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
