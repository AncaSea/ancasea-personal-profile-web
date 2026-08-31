"use client";
import { useEffect, useRef } from "react";

export function WatcherEye() {
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

    let mouse = { x: width / 2, y: height / 2 };
    let isVisible = false;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);
    
    // Smooth trailing coordinates for the retina
    let currentX = 0;
    let currentY = 0;

    const animate = () => {
      if (!isVisible) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Eye position (top center)
      const cx = width / 2;
      const cy = Math.max(height * 0.25, 150);

      // Math for pupil movement
      const dx = mouse.x - cx;
      const dy = mouse.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const maxDistance = 25; // How far the pupil can move from center
      // Calculate target pupil offset based on mouse distance, clamped and scaled
      let targetX = 0;
      let targetY = 0;
      if (dist > 0) {
        targetX = (dx / dist) * Math.min(dist * 0.05, maxDistance);
        targetY = (dy / dist) * Math.min(dist * 0.05, maxDistance);
      }

      // Smooth interpolation
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      // DRAW THE EYE (Cybernetic / Camera Lens style)

      // 1. Outer Ring (Stationary)
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(184, 41, 234, 0.4)"; // Epic Purple base
      ctx.lineWidth = 2;
      ctx.stroke();

      // Outer dashed ring
      ctx.beginPath();
      ctx.arc(cx, cy, 75, 0, Math.PI * 2);
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = "rgba(184, 41, 234, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Eye shape (Almond / Hex)
      ctx.beginPath();
      ctx.ellipse(cx, cy, 100, 40, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(184, 41, 234, 0.8)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(184, 41, 234, 0.5)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Retina/Pupil (Moves)
      const px = cx + currentX;
      const py = cy + currentY;

      // Iris
      ctx.beginPath();
      ctx.arc(px, py, 25, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)"; // Rare Blue for the eye
      ctx.lineWidth = 4;
      ctx.stroke();

      // Pupil Core
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 229, 255, 1)";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0, 229, 255, 1)";
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Cyber crosshair on the pupil
      ctx.beginPath();
      ctx.moveTo(px - 15, py);
      ctx.lineTo(px + 15, py);
      ctx.moveTo(px, py - 15);
      ctx.lineTo(px, py + 15);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw faint background grid just for tech vibe
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(184, 41, 234, 0.05)";
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

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
      mouse.x = e.clientX;
      mouse.y = e.clientY;
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