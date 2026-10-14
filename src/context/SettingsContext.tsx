import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Settings } from "../types";
import { KEYS, storageGet, storageSet } from "../utils/storage";

export const DEFAULT_SETTINGS: Settings = {
  theme: "light",
  temperatureUnit: "C",
  windUnit: "kmh",
  timeFormat: "24h",
  alertsOn: false,
};

type SettingsValue = {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(name: K, value: Settings[K]) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsValue | null>(null);

function loadSettings(): Settings {
  // Merging with the defaults means a missing or older saved value never breaks the app
  const saved = storageGet<Partial<Settings>>(KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // The theme is a data-theme attribute on the page. The CSS colours follow it.
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  const updateSetting = useCallback(
    <K extends keyof Settings>(name: K, value: Settings[K]) => {
      setSettings((current) => {
        const next = { ...current, [name]: value };
        storageSet(KEYS.settings, next);
        return next;
      });
    },
    []
  );

  // Used by "Clear my data". The storage itself is emptied by the caller.
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}