import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import type { CachedForecast, ForecastData, ForecastUnits, Place } from "../types";
import { getForecast } from "../utils/api";
import { cacheKey, storageGet, storageSet } from "../utils/storage";
import { useOnlineStatus } from "./useOnlineStatus";

const CACHE_MAX_AGE = 30 * 60 * 1000; // a saved forecast under 30 minutes old is reused

type ForecastState = {
  forecast: ForecastData | null;
  lastUpdated: number | null;
  isLoading: boolean;
  errorMessage: string;
};

const EMPTY_STATE: ForecastState = {
  forecast: null,
  lastUpdated: null,
  isLoading: false,
  errorMessage: "",
};

export function useForecast(place: Place | null, units: ForecastUnits) {
  const isOnline = useOnlineStatus();
  const { showToast } = useToast();
  const [state, setState] = useState<ForecastState>(EMPTY_STATE);
  const [reloadCount, setReloadCount] = useState(0);

  // Plain values, so the effect only runs when they really change
  const latitude = place?.latitude ?? null;
  const longitude = place?.longitude ?? null;
  const temperatureUnit = units.temperature;
  const windUnit = units.wind;

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setState(EMPTY_STATE);
      return;
    }

    const target: Place = { name: "", latitude, longitude };
    const currentUnits: ForecastUnits = { temperature: temperatureUnit, wind: windUnit };
    const key = cacheKey(target);

    // A saved forecast is only useful when it was saved in the same units
    const saved = storageGet<CachedForecast | null>(key, null);
    const usable =
      saved !== null &&
      saved.units.temperature === temperatureUnit &&
      saved.units.wind === windUnit
        ? saved
        : null;

    const showSaved = (copy: CachedForecast) =>
      setState({
        forecast: copy.data,
        lastUpdated: copy.savedAt,
        isLoading: false,
        errorMessage: "",
      });

    // 1. Fresh saved copy: no server call needed, so it loads fast
    if (usable && Date.now() - usable.savedAt < CACHE_MAX_AGE) {
      showSaved(usable);
      return;
    }

    // 2. No internet: use the saved copy, or explain
    if (!isOnline) {
      if (usable) {
        showSaved(usable);
      } else {
        setState({
          forecast: null,
          lastUpdated: null,
          isLoading: false,
          errorMessage: "No saved weather for this place yet. Connect to the internet and try again.",
        });
      }
      return;
    }

    // 3. Ask the server
    const controller = new AbortController();
    setState({ forecast: null, lastUpdated: null, isLoading: true, errorMessage: "" });

    getForecast(target, currentUnits, controller.signal)
      .then((data) => {
        const savedAt = Date.now();
        storageSet(key, { savedAt, units: currentUnits, data });
        setState({ forecast: data, lastUpdated: savedAt, isLoading: false, errorMessage: "" });
      })
      .catch(() => {
        if (controller.signal.aborted) return; // the person moved on, so ignore it
        if (usable) {
          showSaved(usable);
          showToast("error", "Could not update. Showing saved weather.");
        } else {
          setState({
            forecast: null,
            lastUpdated: null,
            isLoading: false,
            errorMessage: "Could not load the weather. Check your connection and try again.",
          });
        }
      });

    return () => controller.abort();
  }, [latitude, longitude, temperatureUnit, windUnit, isOnline, reloadCount, showToast]);

  const reload = () => setReloadCount((count) => count + 1);

  return { ...state, reload };
}