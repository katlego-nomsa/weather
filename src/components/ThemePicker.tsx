import type { ThemeName } from "../types";
import styles from "./ThemePicker.module.css";

type Props = {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
};

// The preview colours are fixed, so each choice always looks like its own theme
const THEMES: { value: ThemeName; label: string; page: string; card: string; accent: string }[] = [
  { value: "light", label: "Light", page: "#f7f3e8", card: "#ffffff", accent: "#c5f135" },
  { value: "dark", label: "Dark", page: "#171812", card: "#2a2c21", accent: "#c5f135" },
  { value: "lime", label: "Lime", page: "#c5f135", card: "#fffdf2", accent: "#111111" },
];

export default function ThemePicker({ value, onChange }: Props) {
  return (
    <div className={styles.grid} role="group" aria-label="Theme">
      {THEMES.map((theme) => (
        <button
          key={theme.value}
          type="button"
          className={`${styles.option} ${theme.value === value ? styles.selected : ""}`}
          onClick={() => onChange(theme.value)}
          aria-pressed={theme.value === value}
        >
          <span className={styles.preview} style={{ background: theme.page }}>
            <i className={styles.card} style={{ background: theme.card, boxShadow: `0 4px 0 ${theme.accent}` }} />
            <em className={styles.bar} style={{ background: theme.accent }} />
          </span>
          <span className={styles.name}>{theme.label}</span>
        </button>
      ))}
    </div>
  );
}