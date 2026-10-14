import styles from "./ToggleSwitch.module.css";

type Props = {
  isOn: boolean;
  onChange: (isOn: boolean) => void;
  label: string;
};

export default function ToggleSwitch({ isOn, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={label}
      className={`${styles.track} ${isOn ? styles.on : ""}`}
      onClick={() => onChange(!isOn)}
    >
      <span className={styles.knob} />
    </button>
  );
}