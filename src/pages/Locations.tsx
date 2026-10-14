import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import PlaceSearch from "../components/PlaceSearch";
import WeatherIcon from "../components/WeatherIcon";
import { useLocations } from "../context/LocationsContext";
import { useClearData } from "../hooks/useClearData";
import type { CachedForecast, Place, SavedPlace } from "../types";
import { formatTemperatureWithUnit } from "../utils/format";
import { cacheKey, storageGet } from "../utils/storage";
import { describeWeather } from "../utils/weatherCodes";
import styles from "./Locations.module.css";

// The last saved weather for a place, shown on its card (even offline)
function getSummary(place: SavedPlace) {
  const cached = storageGet<CachedForecast | null>(cacheKey(place), null);
  if (!cached) return null;
  const info = describeWeather(cached.data.current.weather_code);
  return {
    icon: info.icon,
    label: info.label,
    temperature: formatTemperatureWithUnit(
      cached.data.current.temperature_2m,
      cached.units.temperature
    ),
  };
}

export default function Locations() {
  const { locations, selectedId, addLocation, removeLocation, selectLocation } = useLocations();
  const navigate = useNavigate();
  const clearData = useClearData();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const summaries = useMemo(() => locations.map(getSummary), [locations]);

  const handleView = (id: string) => {
    selectLocation(id);
    navigate("/");
  };

  const handlePick = (place: Place) => {
    const saved = addLocation(place); // shows the green message itself
    if (saved) setIsAddOpen(false);
  };

  const handleClear = () => {
    clearData();
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <div className={styles.head}>
          <div>
            <h1>Saved locations</h1>
            <p className={styles.count}>
              {locations.length} {locations.length === 1 ? "place" : "places"} · pick one to see its
              weather
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>+ Add a location</Button>
        </div>

        {locations.length === 0 ? (
          <EmptyState
            title="No saved places yet"
            message="Add a city, or search on the Weather page and press Save location."
          >
            <Button onClick={() => setIsAddOpen(true)}>Add a location</Button>
          </EmptyState>
        ) : (
          <ul className={styles.grid}>
            {locations.map((location, index) => {
              const summary = summaries[index];
              const isViewing = location.id === selectedId;
              return (
                <li key={location.id} className={`${styles.card} ${isViewing ? styles.viewing : ""}`}>
                  <div className={styles.top}>
                    <div>
                      <h2>{location.isCurrent ? "My location" : location.name}</h2>
                      <p className={styles.country}>
                        {location.isCurrent ? "Your position" : location.country}
                      </p>
                    </div>
                    {location.isCurrent && <span className={styles.tag}>Current</span>}
                  </div>

                  {summary ? (
                    <>
                      <div className={styles.mid}>
                        <WeatherIcon icon={summary.icon} size={44} />
                        <span className={styles.temp}>{summary.temperature}</span>
                      </div>
                      <p className={styles.condition}>{summary.label}</p>
                    </>
                  ) : (
                    <p className={styles.condition}>No saved weather yet</p>
                  )}

                  <div className={styles.actions}>
                    <Button onClick={() => handleView(location.id)} disabled={isViewing}>
                      {isViewing ? "Viewing now" : "View weather"}
                    </Button>
                    <button
                      type="button"
                      className={styles.remove}
                      onClick={() => removeLocation(location.id)}
                    >
                      Remove
                      <span className="sr-only"> {location.name}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className={styles.note}>
          Your saved places are stored on this device only.{" "}
          <button type="button" className={styles.link} onClick={() => setIsConfirmOpen(true)}>
            Clear my data
          </button>
        </p>
      </main>

      <Modal title="Add a location" isOpen={isAddOpen} onClose={() => setIsAddOpen(false)}>
        <PlaceSearch id="add-place" savedPlaces={locations} onPick={handlePick} />
        <div className={styles.modalActions}>
          <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Clear all your data?"
        message="Your saved places, settings and saved weather will be removed from this device. This cannot be undone."
        confirmLabel="Clear my data"
        onConfirm={handleClear}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}