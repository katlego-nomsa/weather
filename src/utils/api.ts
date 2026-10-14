import type { ForecastData, ForecastUnits, Place } from "../types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string; // the region or province
};

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// Turns a name like "Durban" into a list of matching places
export async function searchPlaces(text: string, signal?: AbortSignal): Promise<Place[]> {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(text)}&count=8&language=en&format=json`;
  const data = await getJson<{ results?: GeocodingResult[] }>(url, signal);

  // When nothing matches, Open-Meteo leaves "results" out completely
  return (data.results ?? []).map((result) => ({
    name: result.name,
    region: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

// Gets the current weather, the hourly forecast and the daily forecast
export function getForecast(
  place: Place,
  units: ForecastUnits,
  signal?: AbortSignal
): Promise<ForecastData> {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
    hourly:
      "temperature_2m,precipitation_probability,precipitation,wind_gusts_10m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto", // times come back in the place's own time zone
    forecast_days: "7",
    temperature_unit: units.temperature === "C" ? "celsius" : "fahrenheit",
    wind_speed_unit: units.wind,
  });

  return getJson<ForecastData>(`${FORECAST_URL}?${params.toString()}`, signal);
}