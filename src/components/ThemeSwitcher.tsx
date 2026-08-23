"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { Button } from "./ui/button";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("theme-futuristic");
    else if (theme === "theme-futuristic") setTheme("theme-glass");
    else setTheme("light");
  };

  return (
    <Button variant="outline" size="icon" onClick={cycleTheme} className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg backdrop-blur-md border-primary/20">
      {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem] text-orange-500" />}
      {theme === "theme-futuristic" && <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />}
      {theme === "theme-glass" && <MonitorSmartphone className="h-[1.2rem] w-[1.2rem] text-purple-500" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}