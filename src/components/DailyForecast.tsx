import { formatDayName, formatPercent, formatTemperature } from "../utils/format";
import type { DayItem } from "../utils/format";
import { describeWeather } from "../utils/weatherCodes";
import WeatherIcon from "./WeatherIcon";
import styles from "./DailyForecast.module.css";

type Props = { days: DayItem[] };

export default function DailyForecast({ days }: Props) {
  // The coldest and hottest values in the week set the scale of the bars
  const coldest = Math.min(...days.map((day) => day.low));
  const hottest = Math.max(...days.map((day) => day.high));
  const range = Math.max(hottest - coldest, 1);

  return (
    <ul className={styles.list} aria-label="Daily forecast">
      {days.map((day, index) => {
        const info = describeWeather(day.weatherCode);
        const left = ((day.low - coldest) / range) * 100;
        const width = Math.max(((day.high - day.low) / range) * 100, 6);
        return (
          <li key={day.date} className={styles.day}>
            <span className={styles.name}>{formatDayName(day.date, index)}</span>
            <WeatherIcon icon={info.icon} size={32} />
            <span className="sr-only">{info.label}</span>
            <span className={styles.low}>{formatTemperature(day.low)}</span>
            <span className={styles.bar} aria-hidden="true">
              <i style={{ left: `${left}%`, width: `${width}%` }} />
            </span>
            <span className={styles.high}>{formatTemperature(day.high)}</span>
            <span className={styles.rain}>{formatPercent(day.rainChance)}</span>
          </li>
        );
      })}
    </ul>
  );
}