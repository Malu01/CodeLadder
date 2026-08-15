"use client";

// Dark-mode provider. Adds/removes the `dark` class on <html> and persists the
// choice in localStorage. Applied once in app/layout.tsx.
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("codeladder_theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(stored ? stored === "dark" : prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    if (typeof window !== "undefined") {
      localStorage.setItem("codeladder_theme", dark ? "dark" : "light");
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
