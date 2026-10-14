import { useCallback, useEffect, useMemo, useState } from "react";
import Banner from "../components/Banner";
import Button from "../components/Button";
import Chip from "../components/Chip";
import CurrentWeather from "../components/CurrentWeather";
import DailyForecast from "../components/DailyForecast";
import EmptyState from "../components/EmptyState";
import HourlyForecast from "../components/HourlyForecast";
import Loader from "../components/Loader";
import LocationPrompt from "../components/LocationPrompt";
import Navbar from "../components/Navbar";
import PinIcon from "../components/PinIcon";
import PlaceSearch from "../components/PlaceSearch";
import SegmentedControl from "../components/SegmentedControl";
import { useLocations } from "../context/LocationsContext";
import { useSettings } from "../context/SettingsContext";
import { useForecast } from "../hooks/useForecast";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import type { ForecastUnits, ForecastView, Place } from "../types";
import { getAlerts } from "../utils/alerts";
import { formatClock, getDailyList, getHourlyList } from "../utils/format";
import { sendNotification } from "../utils/notifications";
import { KEYS, storageGet, storageSet } from "../utils/storage";
import styles from "./Weather.module.css";

const HOURS_SHOWN = 24;

const VIEW_OPTIONS: { value: ForecastView; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
];

// The line under the place name: the region, or the rounded position for "My location"
function describePlace(place: Place): string {
  if (place.isCurrent) {
    const lat = `${Math.abs(place.latitude).toFixed(1)}° ${place.latitude < 0 ? "S" : "N"}`;
    const lon = `${Math.abs(place.longitude).toFixed(1)}° ${place.longitude < 0 ? "W" : "E"}`;
    return `Near ${lat}, ${lon}`;
  }
  return [place.region, place.country].filter(Boolean).join(", ");
}

export default function Weather() {
  const { settings } = useSettings();
  const isOnline = useOnlineStatus();
  const { locations, selectedLocation, addLocation, saveCurrentLocation, selectLocation } =
    useLocations();

  // A place that was searched for but not saved yet
  const [searchedPlace, setSearchedPlace] = useState<Place | null>(null);
  const [view, setView] = useState<ForecastView>("hourly");
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const place: Place | null = searchedPlace ?? selectedLocation;

  const units: ForecastUnits = useMemo(
    () => ({ temperature: settings.temperatureUnit, wind: settings.windUnit }),
    [settings.temperatureUnit, settings.windUnit]
  );

  const { forecast, lastUpdated, isLoading, errorMessage, reload } = useForecast(place, units);

  // Severe weather found in the forecast
  const alerts = useMemo(
    () => (forecast && place ? getAlerts(forecast, place, units, settings.timeFormat) : []),
    [forecast, place, units, settings.timeFormat]
  );

  // Send a browser notification for each new alert, once only
  const placeName = place?.name ?? "";
  useEffect(() => {
    if (!settings.alertsOn || alerts.length === 0) return;
    const alreadyShown = storageGet<string[]>(KEYS.alertsShown, []);
    const fresh = alerts.filter((alert) => !alreadyShown.includes(alert.id));
    if (fresh.length === 0) return;
    fresh.forEach((alert) => sendNotification(`Weather alert: ${placeName}`, alert.message));
    // Keep the list short, so it does not grow forever
    storageSet(KEYS.alertsShown, [...alreadyShown, ...fresh.map((alert) => alert.id)].slice(-50));
  }, [alerts, settings.alertsOn, placeName]);

  const closePrompt = useCallback(() => setIsPromptOpen(false), []);

  const handleFound = (found: Place) => {
    saveCurrentLocation(found);
    setSearchedPlace(null);
    setIsPromptOpen(false);
  };

  const handleSave = () => {
    if (!searchedPlace) return;
    const saved = addLocation(searchedPlace);
    if (saved) setSearchedPlace(null);
  };

  const handleChipClick = (id: string) => {
    selectLocation(id);
    setSearchedPlace(null);
  };

  const subtitle = place
    ? [
        describePlace(place),
        lastUpdated ? `Updated ${formatClock(lastUpdated, settings.timeFormat)}` : "",
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <>
      <Navbar />
      <main className="container">
        <div className={styles.find}>
          <div className={styles.search}>
            <PlaceSearch id="place-search" savedPlaces={locations} onPick={setSearchedPlace} />
          </div>
          <Button variant="secondary" onClick={() => setIsPromptOpen(true)}>
            Use my location
          </Button>
          {searchedPlace && <Button onClick={handleSave}>+ Save location</Button>}
        </div>

        {locations.length > 0 && (
          <div className={styles.chips}>
            <span className={styles.label}>SAVED</span>
            {locations.map((saved) => (
              <Chip
                key={saved.id}
                label={saved.isCurrent ? "My location" : saved.name}
                icon={saved.isCurrent ? <PinIcon size={16} /> : undefined}
                isSelected={place?.id === saved.id}
                onClick={() => handleChipClick(saved.id)}
              />
            ))}
          </div>
        )}

        {!isOnline && forecast && lastUpdated && (
          <div className={styles.gap}>
            <Banner variant="info">
              You are offline. Showing weather saved at {formatClock(lastUpdated, settings.timeFormat)}.
            </Banner>
          </div>
        )}

        {!place ? (
          <EmptyState
            title="Search for a city or use your location"
            message="Your weather appears here, and the places you save are kept on this device."
          >
            <Button onClick={() => setIsPromptOpen(true)}>Use my location</Button>
          </EmptyState>
        ) : isLoading ? (
          <Loader label="Getting the weather" />
        ) : errorMessage ? (
          <EmptyState title="Could not show the weather" message={errorMessage}>
            <Button variant="secondary" onClick={reload}>
              Try again
            </Button>
          </EmptyState>
        ) : forecast ? (
          <>
            <CurrentWeather
              data={forecast}
              title={place.name}
              subtitle={subtitle}
              temperatureUnit={settings.temperatureUnit}
              windUnit={settings.windUnit}
            />

            {alerts.map((alert) => (
              <div key={alert.id} className={styles.gap}>
                <Banner variant="alert" label="ALERT">
                  {alert.message}
                </Banner>
              </div>
            ))}

            <div className={styles.toggle}>
              <SegmentedControl
                options={VIEW_OPTIONS}
                value={view}
                onChange={setView}
                ariaLabel="Forecast view"
              />
            </div>

            <div className={styles.forecast}>
              {view === "hourly" ? (
                <HourlyForecast
                  hours={getHourlyList(forecast, HOURS_SHOWN)}
                  timeFormat={settings.timeFormat}
                />
              ) : (
                <DailyForecast days={getDailyList(forecast)} />
              )}
            </div>
          </>
        ) : null}
      </main>

      <LocationPrompt isOpen={isPromptOpen} onClose={closePrompt} onFound={handleFound} />
    </>
  );
}
