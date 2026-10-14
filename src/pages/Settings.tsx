import { useState } from "react";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import Navbar from "../components/Navbar";
import SegmentedControl from "../components/SegmentedControl";
import ThemePicker from "../components/ThemePicker";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import { useClearData } from "../hooks/useClearData";
import type { TemperatureUnit, TimeFormat, WindUnit } from "../types";
import { askNotificationPermission, notificationsSupported } from "../utils/notifications";
import styles from "./Settings.module.css";

const TEMPERATURE_OPTIONS: { value: TemperatureUnit; label: string }[] = [
  { value: "C", label: "°C" },
  { value: "F", label: "°F" },
];
const WIND_OPTIONS: { value: WindUnit; label: string }[] = [
  { value: "kmh", label: "km/h" },
  { value: "mph", label: "mph" },
];
const TIME_OPTIONS: { value: TimeFormat; label: string }[] = [
  { value: "24h", label: "24-hour" },
  { value: "12h", label: "12-hour" },
];

export default function Settings() {
  const { settings, updateSetting } = useSettings();
  const { showToast } = useToast();
  const clearData = useClearData();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Turning alerts on needs the browser's permission to send notifications
  const handleAlertsChange = async (turnOn: boolean) => {
    if (!turnOn) {
      updateSetting("alertsOn", false);
      return;
    }
    if (!notificationsSupported()) {
      showToast("error", "This browser does not support notifications.");
      return;
    }
    const permission =
      Notification.permission === "default"
        ? await askNotificationPermission()
        : Notification.permission;
    if (permission !== "granted") {
      updateSetting("alertsOn", false);
      showToast("error", "Notifications are blocked. Turn them on in your browser settings.");
      return;
    }
    updateSetting("alertsOn", true);
    showToast("success", "Weather alerts are on");
  };

  const handleClear = () => {
    clearData();
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className={styles.main}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.sub}>Changes apply straight away and are saved on this device.</p>

          <section className={styles.card}>
            <h2>Theme</h2>
            <p className={styles.desc}>Choose how the app looks.</p>
            <ThemePicker value={settings.theme} onChange={(theme) => updateSetting("theme", theme)} />
          </section>

          <section className={styles.card}>
            <h2>Units</h2>
            <p className={styles.desc}>Choose how weather is shown.</p>
            <div className={styles.row}>
              <b>Temperature</b>
              <SegmentedControl
                options={TEMPERATURE_OPTIONS}
                value={settings.temperatureUnit}
                onChange={(value) => updateSetting("temperatureUnit", value)}
                ariaLabel="Temperature unit"
              />
            </div>
            <div className={styles.row}>
              <b>Wind speed</b>
              <SegmentedControl
                options={WIND_OPTIONS}
                value={settings.windUnit}
                onChange={(value) => updateSetting("windUnit", value)}
                ariaLabel="Wind speed unit"
              />
            </div>
            <div className={styles.row}>
              <b>Time</b>
              <SegmentedControl
                options={TIME_OPTIONS}
                value={settings.timeFormat}
                onChange={(value) => updateSetting("timeFormat", value)}
                ariaLabel="Time format"
              />
            </div>
          </section>

          <section className={styles.card}>
            <h2>Alerts</h2>
            <p className={styles.desc}>
              Get a notification when severe weather is expected. Notifications appear while the
              app is open in a tab.
            </p>
            <div className={styles.row}>
              <b>Severe weather alerts</b>
              <ToggleSwitch
                isOn={settings.alertsOn}
                onChange={handleAlertsChange}
                label="Severe weather alerts"
              />
            </div>
          </section>

          <section className={styles.card}>
            <h2>Your data</h2>
            <p className={styles.desc}>
              Saved places, settings and your last forecast are stored on this device only. Your
              position is sent to the weather service (Open-Meteo) only to get the forecast.
            </p>
            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
              Clear my data
            </Button>
          </section>
        </div>
      </main>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Clear all your data?"
        message="Your saved places, settings and saved weather will be removed from this device. This cannot be undone."
        confirmLabel="Clear my data"
        onConfirm={handleClear}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}