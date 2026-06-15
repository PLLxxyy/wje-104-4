import { create } from "zustand";
import { STORAGE_KEYS } from "../constants/app";
import { ThemeMode } from "../types/theme";
import { storage } from "../hooks/useLocalStorage";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const isThemeMode = (value: string): value is ThemeMode => value === "light" || value === "dark";

const getInitialTheme = (): ThemeMode => {
  const stored = storage.getItem<ThemeMode>(STORAGE_KEYS.theme, "light").value;
  return isThemeMode(stored) ? stored : "light";
};

export const applyTheme = (theme: ThemeMode): void => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
};

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (theme: ThemeMode): void => {
    applyTheme(theme);
    storage.setItem(STORAGE_KEYS.theme, theme);
    set({ theme });
  },
  toggleTheme: (): void => {
    const nextTheme: ThemeMode = get().theme === "light" ? "dark" : "light";
    get().setTheme(nextTheme);
  }
}));

