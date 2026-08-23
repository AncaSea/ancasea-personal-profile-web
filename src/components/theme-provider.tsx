"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function RealTimeThemeEnforcer({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  
  React.useEffect(() => {
    // Only enforce real-time theme on first visit (when no theme is in localStorage)
    const storedTheme = localStorage.getItem('theme');
    if (!storedTheme || storedTheme === 'system') {
      const hour = new Date().getHours();
      // Cyberpunk Neon at night (18:00 - 05:59), Minimalist Light at day (06:00 - 17:59)
      if (hour >= 18 || hour < 6) {
        setTheme('theme-futuristic');
      } else {
        setTheme('light');
      }
    }
  }, [setTheme]);

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