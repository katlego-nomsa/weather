import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type Props = {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: ReactNode;
};

export default function Chip({ label, isSelected, onClick, icon }: Props) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${isSelected ? styles.selected : ""}`}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {icon}
      {label}
    </button>
  );
}