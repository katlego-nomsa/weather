import type { AppAlert, ForecastData, ForecastUnits, Place, TimeFormat } from "../types";
import { cacheKey } from "./storage";
import {
  formatHour,
  formatTemperatureWithUnit,
  formatWind,
  getCurrentHourIndex,
} from "./format";

// The limits that count as severe weather
const HOURS_CHECKED = 24;
const STRONG_WIND_KMH = 60;
const HEAVY_RAIN_MM = 10; // within 6 hours
const RAIN_WINDOW_HOURS = 6;
const EXTREME_HEAT_C = 35;
const FREEZING_C = 0;
const THUNDERSTORM_CODES = [95, 96, 99];

const MILES_TO_KM = 1.609;

function toCelsius(value: number, units: ForecastUnits): number {
  return units.temperature === "F" ? ((value - 32) * 5) / 9 : value;
}

function toKmh(value: number, units: ForecastUnits): number {
  return units.wind === "mph" ? value * MILES_TO_KM : value;
}

export function getAlerts(
  data: ForecastData,
  place: Place,
  units: ForecastUnits,
  timeFormat: TimeFormat
): AppAlert[] {
  const start = getCurrentHourIndex(data);
  const end = Math.min(start + HOURS_CHECKED, data.hourly.time.length);
  const today = data.current.time.slice(0, 10);
  const idStart = `${cacheKey(place)}|`;
  const alerts: AppAlert[] = [];

  // 1. Thunderstorm: the first hour with a storm weather code
  for (let i = start; i < end; i += 1) {
    if (THUNDERSTORM_CODES.includes(data.hourly.weather_code[i])) {
      alerts.push({
        id: `${idStart}thunderstorm|${today}`,
        type: "thunderstorm",
        message: `Thunderstorm expected around ${formatHour(data.hourly.time[i], timeFormat)}.`,
      });
      break;
    }
  }

  // 2. Strong wind: the strongest gust in the window
  let strongestGust = 0;
  for (let i = start; i < end; i += 1) {
    strongestGust = Math.max(strongestGust, data.hourly.wind_gusts_10m[i] ?? 0);
  }
  if (toKmh(strongestGust, units) >= STRONG_WIND_KMH) {
    alerts.push({
      id: `${idStart}wind|${today}`,
      type: "wind",
      message: `Strong wind expected, with gusts up to ${formatWind(strongestGust, units.wind)}.`,
    });
  }

  // 3. Heavy rain: the wettest stretch of 6 hours in a row
  let wettestSpell = 0;
  for (let i = start; i < end; i += 1) {
    let total = 0;
    for (let j = i; j < Math.min(i + RAIN_WINDOW_HOURS, end); j += 1) {
      total += data.hourly.precipitation[j] ?? 0;
    }
    wettestSpell = Math.max(wettestSpell, total);
  }
  if (wettestSpell >= HEAVY_RAIN_MM) {
    alerts.push({
      id: `${idStart}rain|${today}`,
      type: "rain",
      message: `Heavy rain expected: about ${Math.round(wettestSpell)} mm within a few hours.`,
    });
  }

  // 4 and 5. Extreme heat and freezing cold: the highest and lowest temperature
  let hottest = -Infinity;
  let coldest = Infinity;
  for (let i = start; i < end; i += 1) {
    hottest = Math.max(hottest, data.hourly.temperature_2m[i]);
    coldest = Math.min(coldest, data.hourly.temperature_2m[i]);
  }
  if (toCelsius(hottest, units) >= EXTREME_HEAT_C) {
    alerts.push({
      id: `${idStart}heat|${today}`,
      type: "heat",
      message: `Very hot weather expected, up to ${formatTemperatureWithUnit(hottest, units.temperature)}.`,
    });
  }
  if (toCelsius(coldest, units) <= FREEZING_C) {
    alerts.push({
      id: `${idStart}cold|${today}`,
      type: "cold",
      message: `Freezing weather expected, down to ${formatTemperatureWithUnit(coldest, units.temperature)}.`,
    });
  }

  return alerts;
}