import type { ReactNode } from "react";
import styles from "./Banner.module.css";

type Props = {
  variant: "alert" | "info";
  label?: string; // a small tag like "ALERT"
  children: ReactNode;
};

export default function Banner({ variant, label, children }: Props) {
  return (
    <div
      className={`${styles.banner} ${styles[variant]}`}
      role={variant === "alert" ? "alert" : "status"}
    >
      {label && <b className={styles.label}>{label}</b>}
      <span>{children}</span>
    </div>
  );
}