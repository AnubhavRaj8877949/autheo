import { createContext, useContext, useState, useLayoutEffect } from "react";

export const ThemeContext = createContext();

// Get initial theme safely
const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme");

    // If user already picked -> respect it
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;

    // Default when nothing stored
    return true; 
  }

  // SSR fallback = dark
  return true;
};

// Apply theme early to avoid flicker
if (typeof window !== "undefined") {
  const savedTheme = localStorage.getItem("theme");

  document.documentElement.setAttribute(
    "data-theme",
    savedTheme === "light" ? "light" : "dark" 
  );
}

export const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(getInitialTheme);

  useLayoutEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");

    // Apply theme attribute to document root
    document.documentElement.setAttribute(
      "data-theme",
      isDarkTheme ? "dark" : "light"
    );
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, setIsDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
