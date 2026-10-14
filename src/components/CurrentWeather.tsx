import type { ForecastData, TemperatureUnit, WindUnit } from "../types";
import {
  formatPercent,
  formatTemperatureWithUnit,
  formatWind,
  getCurrentHourIndex,
} from "../utils/format";
import { describeWeather } from "../utils/weatherCodes";
import WeatherIcon from "./WeatherIcon";
import styles from "./CurrentWeather.module.css";

type Props = {
  data: ForecastData;
  title: string;
  subtitle: string;
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
};

export default function CurrentWeather({ data, title, subtitle, temperatureUnit, windUnit }: Props) {
  const current = data.current;
  const info = describeWeather(current.weather_code);
  const rainChance = data.hourly.precipitation_probability[getCurrentHourIndex(data)] ?? 0;

  return (
    <section className={styles.card} aria-label="Current weather">
      <div>
        <h1 className={styles.place}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        <div className={styles.now}>
          <div className={styles.disc}>
            <WeatherIcon icon={info.icon} size={64} />
          </div>
          <div>
            <p className={styles.temp}>
              {formatTemperatureWithUnit(current.temperature_2m, temperatureUnit)}
            </p>
            <p className={styles.condition}>{info.label}</p>
          </div>
        </div>
      </div>

      <dl className={styles.stats}>
        <div>
          <dt>Humidity</dt>
          <dd>{formatPercent(current.relative_humidity_2m)}</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{formatWind(current.wind_speed_10m, windUnit)}</dd>
        </div>
        <div>
          <dt>Feels like</dt>
          <dd>{formatTemperatureWithUnit(current.apparent_temperature, temperatureUnit)}</dd>
        </div>
        <div>
          <dt>Rain chance</dt>
          <dd>{formatPercent(rainChance)}</dd>
        </div>
      </dl>
    </section>
  );
}