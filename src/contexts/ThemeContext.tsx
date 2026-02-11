import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../utils/api";
import type { Theme } from "../types";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("dark");
  const [loading, setLoading] = useState(true);

  // Detect system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  };

  // Calculate effective theme based on user preference and system
  const calculateEffectiveTheme = (userTheme: Theme): "light" | "dark" => {
    if (userTheme === "system") {
      return getSystemTheme();
    }
    return userTheme;
  };

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const preferences = await api.getPreferences();
        const userTheme = preferences.theme;
        setThemeState(userTheme);
        setEffectiveTheme(calculateEffectiveTheme(userTheme));
      } catch (error) {
        console.error("Failed to load theme:", error);
        // Default to system theme on error
        setEffectiveTheme(getSystemTheme());
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Listen for system theme changes when theme is "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (e: MediaQueryListEvent) => {
      setEffectiveTheme(e.matches ? "light" : "dark");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  const setTheme = async (newTheme: Theme) => {
    try {
      await api.updateTheme(newTheme);
      setThemeState(newTheme);
      setEffectiveTheme(calculateEffectiveTheme(newTheme));
    } catch (error) {
      console.error("Failed to update theme:", error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
