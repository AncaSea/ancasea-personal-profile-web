"use client";
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Disable smooth scrolling in admin dashboard for native UX and middle-mouse scrolling
    if (pathname?.startsWith('/admin')) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
    });
    
    return () => lenis.destroy();
  }, [pathname]);

  return <>{children}</>;
}