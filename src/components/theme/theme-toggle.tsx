"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect } from "react";

import { cn } from "@/lib/utils";

const STORAGE_KEY = "ghichu-theme";

function preferredTheme() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({ className }: { className?: string }) {
  useLayoutEffect(() => {
    applyTheme(preferredTheme());
  }, []);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn("theme-toggle", className)}
      aria-label="Đổi giao diện sáng hoặc tối"
      title="Đổi giao diện sáng/tối"
    >
      <Sun className="theme-icon-sun size-4" aria-hidden="true" />
      <Moon className="theme-icon-moon size-4" aria-hidden="true" />
    </button>
  );
}
