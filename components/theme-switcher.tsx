"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    // Toggle between light and dark mode only
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const ICON_SIZE = 16;

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      aria-label={`Basculer vers le thème ${theme === "dark" ? "clair" : "sombre"}`}
    >
      {theme === "dark" ? (
        <Sun
          key="light"
          size={ICON_SIZE}
          className="text-muted-foreground"
        />
      ) : (
        <Moon
          key="dark"
          size={ICON_SIZE}
          className="text-muted-foreground"
        />
      )}
    </Button>
  );
};

export { ThemeSwitcher };
