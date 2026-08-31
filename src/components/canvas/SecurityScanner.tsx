"use client";
import { useEffect, useRef } from "react";

export function SecurityScanner() {
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
    
    // Smooth trailing mouse coordinates
    let currentX = width / 2;
    let currentY = height / 2;

    const animate = () => {
      if (!isVisible) {
        requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      
      // Interpolate for smooth laser movement
      currentX += (mouse.x - currentX) * 0.1;
      currentY += (mouse.y - currentY) * 0.1;

      // Draw faint background grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 255, 136, 0.05)"; // Neon green
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

      // 1. Horizontal Laser
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(width, currentY);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.6)"; // Bright green
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(0, 255, 136, 1)";
      ctx.stroke();
      
      // 2. Vertical Laser
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
      
      // Reset shadow for reticle
      ctx.shadowBlur = 0;

      // 3. Scanner Reticle at intersection
      ctx.beginPath();
      ctx.arc(currentX, currentY, 20, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 136, 1)";
      ctx.fill();
      
      // Corner brackets of reticle
      const s = 30; // size of bracket
      const l = 10; // length of bracket line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 136, 1)";
      // Top left
      ctx.moveTo(currentX - s, currentY - s + l);
      ctx.lineTo(currentX - s, currentY - s);
      ctx.lineTo(currentX - s + l, currentY - s);
      // Top right
      ctx.moveTo(currentX + s - l, currentY - s);
      ctx.lineTo(currentX + s, currentY - s);
      ctx.lineTo(currentX + s, currentY - s + l);
      // Bottom left
      ctx.moveTo(currentX - s, currentY + s - l);
      ctx.lineTo(currentX - s, currentY + s);
      ctx.lineTo(currentX - s + l, currentY + s);
      // Bottom right
      ctx.moveTo(currentX + s - l, currentY + s);
      ctx.lineTo(currentX + s, currentY + s);
      ctx.lineTo(currentX + s, currentY + s - l);
      ctx.stroke();

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