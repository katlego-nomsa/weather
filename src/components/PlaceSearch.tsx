import { useEffect, useState } from "react";
import type { Place } from "../types";
import { searchPlaces } from "../utils/api";
import { roundCoordinate } from "../utils/storage";
import PinIcon from "./PinIcon";
import styles from "./PlaceSearch.module.css";

type Props = {
  id: string;
  savedPlaces: Place[];
  onPick: (place: Place) => void;
  autoFocus?: boolean;
};

const MIN_LENGTH = 2;
const SEARCH_DELAY = 400; // wait a moment after typing before searching

function isAlreadySaved(place: Place, savedPlaces: Place[]): boolean {
  return savedPlaces.some(
    (saved) =>
      roundCoordinate(saved.latitude) === roundCoordinate(place.latitude) &&
      roundCoordinate(saved.longitude) === roundCoordinate(place.longitude)
  );
}

export default function PlaceSearch({ id, savedPlaces, onPick, autoFocus = false }: Props) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const term = text.trim();
  const isLongEnough = term.length >= MIN_LENGTH;

  useEffect(() => {
    if (term.length < MIN_LENGTH) {
      setResults([]);
      setErrorMessage("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setErrorMessage("");

    const timer = setTimeout(async () => {
      try {
        const found = await searchPlaces(term, controller.signal);
        setResults(found);
      } catch {
        if (controller.signal.aborted) return;
        setResults([]);
        setErrorMessage(
          navigator.onLine
            ? "Search failed. Please try again."
            : "You are offline. Saved places still work."
        );
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, SEARCH_DELAY);

    // Typing again cancels the search that is still waiting
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term]);

  const handlePick = (place: Place) => {
    onPick(place);
    setText("");
  };

  return (
    <div className={styles.wrap}>
      <label htmlFor={id} className="sr-only">
        Search for a city
      </label>
      <input
        id={id}
        className={styles.input}
        type="search"
        placeholder="Search for a city"
        value={text}
        onChange={(event) => setText(event.target.value)}
        autoComplete="off"
        autoFocus={autoFocus}
      />

      {term !== "" && !isLongEnough && <p className={styles.hint}>Type at least 2 letters.</p>}

      {isLongEnough && isSearching && <p className={styles.hint}>Searching…</p>}

      {isLongEnough && !isSearching && errorMessage !== "" && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      {isLongEnough && !isSearching && errorMessage === "" && results.length === 0 && (
        <p className={styles.hint}>{`No places match "${term}". Check the spelling.`}</p>
      )}

      {isLongEnough && !isSearching && results.length > 0 && (
        <ul className={styles.list}>
          {results.map((place) => {
            const saved = isAlreadySaved(place, savedPlaces);
            const where = [place.region, place.country].filter(Boolean).join(", ");
            return (
              <li key={`${place.latitude},${place.longitude}`}>
                <button
                  type="button"
                  className={styles.result}
                  disabled={saved}
                  onClick={() => handlePick(place)}
                >
                  <PinIcon />
                  <span className={styles.text}>
                    <b>{place.name}</b>
                    <span>{where}</span>
                  </span>
                  {saved && <span className={styles.tag}>Already saved</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}