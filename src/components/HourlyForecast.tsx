import type { TimeFormat } from "../types";
import { formatHour, formatPercent, formatTemperature } from "../utils/format";
import type { HourItem } from "../utils/format";
import { describeWeather } from "../utils/weatherCodes";
import WeatherIcon from "./WeatherIcon";
import styles from "./HourlyForecast.module.css";

type Props = {
  hours: HourItem[];
  timeFormat: TimeFormat;
};

export default function HourlyForecast({ hours, timeFormat }: Props) {
  return (
    <ul className={styles.list} aria-label="Hourly forecast">
      {hours.map((hour, index) => {
        const info = describeWeather(hour.weatherCode);
        return (
          <li key={hour.time} className={`${styles.hour} ${index === 0 ? styles.now : ""}`}>
            <span className={styles.time}>{index === 0 ? "Now" : formatHour(hour.time, timeFormat)}</span>
            <WeatherIcon icon={info.icon} size={36} />
            <span className="sr-only">{info.label}</span>
            <span className={styles.temp}>{formatTemperature(hour.temperature)}</span>
            <span className={styles.rain}>{formatPercent(hour.rainChance)} rain</span>
          </li>
        );
      })}
    </ul>
  );
}