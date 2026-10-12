"use client";
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      return;
    }

    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      allowNestedScroll: true,
      prevent: (node) => {
        return (
          node.hasAttribute('data-lenis-prevent') ||
          node.getAttribute('data-lenis-prevent') === 'true'
        );
      },
    });
    
    return () => lenis.destroy();
  }, [pathname]);

  return <>{children}</>;
}
