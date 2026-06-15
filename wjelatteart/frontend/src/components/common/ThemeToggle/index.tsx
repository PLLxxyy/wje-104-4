import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../../stores/useThemeStore";
import styles from "./styles.module.css";

export const ThemeToggle = (): JSX.Element => {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      className={styles.toggle}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "切换到浅色主题" : "切换到深色主题"}
      title={isDark ? "切换到浅色主题" : "切换到深色主题"}
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      <span>{isDark ? "拿铁白" : "浓缩棕"}</span>
    </button>
  );
};

