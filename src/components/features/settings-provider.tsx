"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  currency: string;
  theme: string;
  setTheme: (theme: string) => void;
  setCurrency: (currency: string) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  currency: "USD",
  theme: "light",
  setTheme: () => {},
  setCurrency: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? match[2] : null;
    };
    const savedTheme = getCookie("theme") || "light";
    const savedCurrency = getCookie("preferred_currency") || "USD";
    setTheme(savedTheme);
    setCurrency(savedCurrency);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <SettingsContext.Provider value={{ currency, theme, setTheme, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}
