"use client";
import { useEffect, useRef } from "react";

export function MatrixTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.parentElement?.offsetWidth || window.innerWidth;
    let height = canvas.parentElement?.offsetHeight || window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let isVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const chars = "01{}</>[]#*&!$";
    class CodeDrop {
      x: number; y: number;
      char: string;
      life: number;
      maxLife: number;

      constructor(x: number, y: number) {
        this.x = x + (Math.random() - 0.5) * 20;
        this.y = y + (Math.random() - 0.5) * 20;
        this.char = chars[Math.floor(Math.random() * chars.length)];
        this.life = 1;
        this.maxLife = Math.random() * 50 + 50; // Fade out duration
      }

      update() {
        this.y += 0.3; // Fall down slowly
        this.life += 0.5;
      }

      draw() {
        if (!ctx) return;
        const opacity = 1 - (this.life / this.maxLife);
        ctx.fillStyle = `rgba(0, 229, 255, ${opacity})`; // Cyan
        ctx.font = "16px monospace";
        ctx.fillText(this.char, this.x, this.y);
      }
    }

    let drops: CodeDrop[] = [];

    const animate = () => {
      if (!isVisible) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < drops.length; i++) {
        drops[i].update();
        drops[i].draw();
      }
      
      // Remove dead drops
      drops = drops.filter(d => d.life < d.maxLife);

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.parentElement?.offsetWidth || window.innerWidth;
      height = canvas.parentElement?.offsetHeight || window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Spawn drops on movement
      drops.push(new CodeDrop(x, y));
      if (Math.random() > 0.5) drops.push(new CodeDrop(x, y));
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0 opacity-80"
      style={{ width: '100%', height: '100%' }}
    />
  );
}