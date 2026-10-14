import styles from "./Loader.module.css";

type Props = { label?: string };

export default function Loader({ label = "Loading" }: Props) {
  return (
    <div className={styles.wrap} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}