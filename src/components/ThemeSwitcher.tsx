"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, MonitorSmartphone, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

const themeNames: Record<string, string> = {
  "light": "Light Mode",
  "theme-futuristic": "Dark Futuristic",
  "auto": "Auto (Time-based)",
  "theme-glass": "Glassmorphism"
};

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setIsAuto(localStorage.getItem('theme-mode-auto') === 'true');
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    let nextTheme = "light";
    let willBeAuto = false;
    
    // Determine the next state based on current state
    if (isAuto) {
       willBeAuto = false;
       nextTheme = "theme-glass";
    } else if (theme === "light") {
       willBeAuto = false;
       nextTheme = "theme-futuristic";
    } else if (theme === "theme-futuristic") {
       willBeAuto = true;
       const hour = new Date().getHours();
       nextTheme = (hour >= 18 || hour < 6) ? "theme-futuristic" : "light";
    } else {
       willBeAuto = false;
       nextTheme = "light";
    }
    
    // Update local state and storage
    setIsAuto(willBeAuto);
    if (willBeAuto) {
      localStorage.setItem('theme-mode-auto', 'true');
      toast.success("Theme changed to Auto (Time-based)", { position: "top-center", duration: 3000 });
    } else {
      localStorage.setItem('theme-mode-auto', 'false');
      const name = themeNames[nextTheme];
      toast.success("Theme changed to " + name, { position: "top-center", duration: 3000 });
    }
    
    // Tell next-themes about the real active theme
    setTheme(nextTheme);
  };

  const displayState = isAuto ? "auto" : (theme || "light");
  const currentThemeName = themeNames[displayState] || "Loading...";

  return (
    <div className="fixed bottom-6 left-6 z-50 group flex flex-col items-center">
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-popover/80 backdrop-blur-md text-popover-foreground text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-border shadow-lg">
        {currentThemeName}
      </div>
      <Button variant="outline" size="icon" onClick={cycleTheme} className="rounded-full shadow-lg backdrop-blur-md border-primary/20">
        {!isAuto && theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem] text-orange-500" />}
        {!isAuto && theme === "theme-futuristic" && <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />}
        {isAuto && <Clock className="h-[1.2rem] w-[1.2rem] text-green-500" />}
        {!isAuto && theme === "theme-glass" && <MonitorSmartphone className="h-[1.2rem] w-[1.2rem] text-purple-500" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}