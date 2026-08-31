"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function RealTimeThemeEnforcer({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  
  React.useEffect(() => {
    let animationFrameId: number;
    
    const enforceTheme = () => {
      if (localStorage.getItem('theme-mode-auto') === 'true') {
        const hour = new Date().getHours();
        const timeTheme = (hour >= 18 || hour < 6) ? 'theme-futuristic' : 'light';
        
        // Aggressively ensure the class is present on the root element.
        // next-themes sometimes silently drops the setTheme call during hydration.
        const root = document.documentElement;
        if (!root.classList.contains(timeTheme)) {
           // We explicitly call setTheme so next-themes knows about it
           setTheme(timeTheme);
           // AND we force the class immediately to prevent visual glitches
           root.classList.remove('light', 'theme-futuristic', 'theme-glass', 'dark');
           root.classList.add(timeTheme);
           root.style.colorScheme = timeTheme === 'light' ? 'light' : 'dark';
        }
      }
    };

    // Run immediately
    enforceTheme();

    // Aggressively check for the first 2 seconds to beat any next-themes hydration reverts
    let checks = 0;
    const aggressiveCheck = () => {
      enforceTheme();
      checks++;
      if (checks < 20) {
        animationFrameId = requestAnimationFrame(aggressiveCheck);
      }
    };
    animationFrameId = requestAnimationFrame(aggressiveCheck);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') enforceTheme();
    };
    window.addEventListener('visibilitychange', handleVisibility);
    
    // BEST PRACTICE: Check the clock every 1 minute.
    // This provides a seamless "magic" transition for active readers 
    // exactly at 18:00, while consuming virtually 0% background CPU.
    const intervalId = setInterval(enforceTheme, 60000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [setTheme, theme]);

  return <>{children}</>;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <RealTimeThemeEnforcer>{children}</RealTimeThemeEnforcer>
    </NextThemesProvider>
  )
}