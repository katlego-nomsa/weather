import type { ForecastData, TimeFormat, TemperatureUnit, WindUnit } from "../types";

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°`;
}

export function formatTemperatureWithUnit(value: number, unit: TemperatureUnit): string {
  return `${Math.round(value)}°${unit}`;
}

export function formatWind(value: number, unit: WindUnit): string {
  return `${Math.round(value)} ${unit === "kmh" ? "km/h" : "mph"}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// "2026-10-12T15:00" becomes "15:00" or "3 PM". The text is already in the
// place's own time zone, so we read it directly and do not convert it.
export function formatHour(isoTime: string, format: TimeFormat): string {
  const hour = Number(isoTime.slice(11, 13));
  const minutes = isoTime.slice(14, 16);
  if (format === "24h") {
    return `${String(hour).padStart(2, "0")}:${minutes}`;
  }
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${suffix}`;
}

// A moment in time (milliseconds) shown as a clock time, for "Updated 15:42"
export function formatClock(timestamp: number, format: TimeFormat): string {
  return new Date(timestamp).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  });
}

// "2026-10-13" becomes "Tuesday". The first day is shown as "Today".
export function formatDayName(isoDate: string, index: number): string {
  if (index === 0) return "Today";
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-ZA", { weekday: "long" });
}

export type HourItem = {
  time: string;
  temperature: number;
  rainChance: number;
  weatherCode: number;
};

export type DayItem = {
  date: string;
  low: number;
  high: number;
  rainChance: number;
  weatherCode: number;
};

// The position of the hour that contains "now" in the place's own time
export function getCurrentHourIndex(data: ForecastData): number {
  const now = data.current.time;
  let index = 0;
  for (let i = 0; i < data.hourly.time.length; i += 1) {
    if (data.hourly.time[i] <= now) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}

// The next "count" hours, starting from the current hour
export function getHourlyList(data: ForecastData, count: number): HourItem[] {
  const start = getCurrentHourIndex(data);
  const end = Math.min(start + count, data.hourly.time.length);
  const items: HourItem[] = [];
  for (let i = start; i < end; i += 1) {
    items.push({
      time: data.hourly.time[i],
      temperature: data.hourly.temperature_2m[i],
      rainChance: data.hourly.precipitation_probability[i] ?? 0,
      weatherCode: data.hourly.weather_code[i],
    });
  }
  return items;
}

export function getDailyList(data: ForecastData): DayItem[] {
  return data.daily.time.map((date, i) => ({
    date,
    low: data.daily.temperature_2m_min[i],
    high: data.daily.temperature_2m_max[i],
    rainChance: data.daily.precipitation_probability_max[i] ?? 0,
    weatherCode: data.daily.weather_code[i],
  }));
}