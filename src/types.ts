export type ThemeName = "light" | "dark" | "lime";
export type TemperatureUnit = "C" | "F";
export type WindUnit = "kmh" | "mph";
export type TimeFormat = "24h" | "12h";
export type ForecastView = "hourly" | "daily";

export type Settings = {
  theme: ThemeName;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  timeFormat: TimeFormat;
  alertsOn: boolean;
};

// A place on the map. "id" only exists once the place is saved.
export type Place = {
  id?: string;
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  isCurrent?: boolean; // true for "My location"
};

export type SavedPlace = Place & { id: string };

// The part of Open-Meteo's answer that the app uses
export type ForecastData = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    wind_gusts_10m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
};

export type ForecastUnits = {
  temperature: TemperatureUnit;
  wind: WindUnit;
};

// A forecast saved on the device for offline use
export type CachedForecast = {
  savedAt: number; // milliseconds
  units: ForecastUnits;
  data: ForecastData;
};

export type AppAlert = {
  id: string;
  type: "thunderstorm" | "wind" | "rain" | "heat" | "cold";
  message: string;
};