"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn btn-ghost h-9 w-9 rounded-full"
    >
      {isDark ? <Sun size={16}/> : <Moon size={16}/>}
    </button>
  );
}
