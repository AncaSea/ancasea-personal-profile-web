"use client";
import { useEffect, useRef } from "react";

export function GridDistortion() {
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

    let mouse = { x: -1000, y: -1000 };
    let isVisible = false;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const spacing = 40;
    
    const animate = () => {
      if (!isVisible) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      
      const mousePower = 150; // Radius of effect

      // Draw vertical lines
      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 10) {
          let dx = mouse.x - x;
          let dy = mouse.y - y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          
          let drawX = x;
          let drawY = y;
          
          if (dist < mousePower) {
            const force = (mousePower - dist) / mousePower;
            drawX -= (dx / dist) * force * 10; // Warp away
          }
          
          if (y === 0) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        }
        ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 10) {
          let dx = mouse.x - x;
          let dy = mouse.y - y;
          let dist = Math.sqrt(dx*dx + dy*dy);
          
          let drawX = x;
          let drawY = y;
          
          if (dist < mousePower) {
            const force = (mousePower - dist) / mousePower;
            drawY -= (dy / dist) * force * 10; // Warp away
          }
          
          if (x === 0) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        }
        ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
        ctx.stroke();
      }

      // Draw glow at mouse
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
      gradient.addColorStop(0, "rgba(184, 41, 234, 0.15)"); // Purple glow
      gradient.addColorStop(1, "rgba(184, 41, 234, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

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
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}