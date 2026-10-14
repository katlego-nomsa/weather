import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Place, SavedPlace } from "../types";
import { newId } from "../utils/id";
import {
  KEYS,
  cacheKey,
  roundCoordinate,
  storageGet,
  storageRemove,
  storageSet,
} from "../utils/storage";
import { useToast } from "./ToastContext";

type LocationsValue = {
  locations: SavedPlace[];
  selectedId: string | null;
  selectedLocation: SavedPlace | null;
  addLocation: (place: Place) => SavedPlace | null;
  saveCurrentLocation: (place: Place) => SavedPlace;
  removeLocation: (id: string) => void;
  selectLocation: (id: string) => void;
  clearLocations: () => void;
};

const LocationsContext = createContext<LocationsValue | null>(null);

function isSamePlace(a: Place, b: Place): boolean {
  return (
    roundCoordinate(a.latitude) === roundCoordinate(b.latitude) &&
    roundCoordinate(a.longitude) === roundCoordinate(b.longitude)
  );
}

export function LocationsProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [locations, setLocations] = useState<SavedPlace[]>(() =>
    storageGet<SavedPlace[]>(KEYS.locations, [])
  );
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    storageGet<string | null>(KEYS.selectedId, null)
  );

  const saveAll = (list: SavedPlace[], id: string | null) => {
    setLocations(list);
    setSelectedId(id);
    storageSet(KEYS.locations, list);
    storageSet(KEYS.selectedId, id);
  };

  // Saves a searched place. Returns null when it is already saved.
  const addLocation = useCallback(
    (place: Place): SavedPlace | null => {
      const existing = locations.find((saved) => isSamePlace(saved, place));
      if (existing) {
        showToast("error", `${place.name} is already saved`);
        return null;
      }
      const saved: SavedPlace = { ...place, id: newId() };
      saveAll([...locations, saved], saved.id);
      showToast("success", `${place.name} saved to your locations`);
      return saved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locations, showToast]
  );

  // "My location" from the browser. Only one can exist, so the older one is replaced.
  const saveCurrentLocation = useCallback(
    (place: Place): SavedPlace => {
      const older = locations.filter((saved) => saved.isCurrent);
      older.forEach((saved) => storageRemove(cacheKey(saved)));
      const others = locations.filter((saved) => !saved.isCurrent);

      const saved: SavedPlace = { ...place, id: newId(), isCurrent: true };
      saveAll([saved, ...others], saved.id);
      showToast("success", "Showing weather for your location");
      return saved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locations, showToast]
  );

  const removeLocation = useCallback(
    (id: string) => {
      const removed = locations.find((saved) => saved.id === id);
      if (!removed) return;
      storageRemove(cacheKey(removed));
      const remaining = locations.filter((saved) => saved.id !== id);
      const nextId = selectedId === id ? (remaining[0]?.id ?? null) : selectedId;
      saveAll(remaining, nextId);
      showToast("success", `${removed.name} removed`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locations, selectedId, showToast]
  );

  const selectLocation = useCallback((id: string) => {
    setSelectedId(id);
    storageSet(KEYS.selectedId, id);
  }, []);

  // Used by "Clear my data". The storage itself is emptied by the caller.
  const clearLocations = useCallback(() => {
    setLocations([]);
    setSelectedId(null);
  }, []);

  const selectedLocation = locations.find((saved) => saved.id === selectedId) ?? null;

  return (
    <LocationsContext.Provider
      value={{
        locations,
        selectedId,
        selectedLocation,
        addLocation,
        saveCurrentLocation,
        removeLocation,
        selectLocation,
        clearLocations,
      }}
    >
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations() {
  const value = useContext(LocationsContext);
  if (!value) throw new Error("useLocations must be used inside LocationsProvider");
  return value;
}