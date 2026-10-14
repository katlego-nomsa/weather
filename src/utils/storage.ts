import type { Place } from "../types";

export const KEYS = {
  locations: "weather.locations",
  selectedId: "weather.selectedId",
  settings: "weather.settings",
  alertsShown: "weather.alertsShown",
} as const;

export function storageGet<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(key);
    if (text === null) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

// Returns false when the value could not be saved (storage full or blocked)
export function storageSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // nothing to do
  }
}

// Rounded coordinates, about 1 km. Used for privacy and as the cache key.
export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

// One saved forecast per place, even for a place that is not saved yet
export function cacheKey(place: Place): string {
  return `weather.cache.${roundCoordinate(place.latitude)},${roundCoordinate(place.longitude)}`;
}

// Used by "Clear my data": removes every key that starts with "weather."
export function removeAllWeatherData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith("weather.")) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // nothing to do
  }
}