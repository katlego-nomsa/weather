import type { WeatherIcon as IconName } from "../utils/weatherCodes";

type Props = {
  icon: IconName;
  size?: number;
};

const CLOUD = "M17.5 15H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 0 1 0 9z";

export default function WeatherIcon({ icon, size = 40 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon === "sun" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {icon === "cloud" && <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a5 5 0 0 1 0 9z" />}
      {icon === "rain" && (
        <>
          <path d={CLOUD} />
          <path d="M8 18v3M12 18v3M16 18v3" />
        </>
      )}
      {icon === "snow" && (
        <>
          <path d={CLOUD} />
          <path d="M8 19h.01M12 19h.01M16 19h.01M10 22h.01M14 22h.01" />
        </>
      )}
      {icon === "fog" && <path d="M4 8h16M2 12h20M5 16h14M8 20h8" />}
      {icon === "storm" && (
        <>
          <path d={CLOUD} />
          <path d="M13 15l-3 4h4l-3 4" />
        </>
      )}
    </svg>
  );
}