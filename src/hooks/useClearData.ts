import { useCallback } from "react";
import { useLocations } from "../context/LocationsContext";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import { removeAllWeatherData } from "../utils/storage";

// Removes everything the app saved on this device, and resets what is on screen
export function useClearData() {
  const { resetSettings } = useSettings();
  const { clearLocations } = useLocations();
  const { showToast } = useToast();

  return useCallback(() => {
    removeAllWeatherData();
    resetSettings();
    clearLocations();
    showToast("success", "Your data was cleared");
  }, [resetSettings, clearLocations, showToast]);
}