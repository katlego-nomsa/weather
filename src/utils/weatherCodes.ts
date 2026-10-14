export type WeatherIcon = "sun" | "cloud" | "rain" | "snow" | "fog" | "storm";

export type WeatherDescription = {
  label: string;
  icon: WeatherIcon;
};

export function describeWeather(code: number): WeatherDescription {
  if (code === 0) return { label: "Clear", icon: "sun" };
  if (code >= 1 && code <= 3) return { label: "Partly cloudy", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Fog", icon: "fog" };
  if (code >= 51 && code <= 67) return { label: "Rain or drizzle", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: "rain" };
  if (code >= 85 && code <= 86) return { label: "Snow showers", icon: "snow" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", icon: "storm" };
  return { label: "Unknown", icon: "cloud" };
}