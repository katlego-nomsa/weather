import type { Place } from "../types";
import { roundCoordinate } from "./storage";

export type LocationFailure = "denied" | "unavailable" | "timeout" | "unsupported";

const LOCATION_TIMEOUT = 10000; // 10 seconds
const MAX_AGE = 10 * 60 * 1000; // a position up to 10 minutes old is fine

export class LocationError extends Error {
  reason: LocationFailure;

  constructor(reason: LocationFailure) {
    super(reason);
    this.reason = reason;
  }
}

// Asks the browser for the person's position. The browser shows its own permission box.
// The position is rounded to about 1 km before it is used, for privacy.
export function getMyPlace(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new LocationError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: "My location",
          latitude: roundCoordinate(position.coords.latitude),
          longitude: roundCoordinate(position.coords.longitude),
          isCurrent: true,
        });
      },
      (error) => {
        if (error.code === 1) reject(new LocationError("denied"));
        else if (error.code === 3) reject(new LocationError("timeout"));
        else reject(new LocationError("unavailable"));
      },
      { timeout: LOCATION_TIMEOUT, maximumAge: MAX_AGE }
    );
  });
}

export function describeLocationFailure(error: unknown): string {
  const reason = error instanceof LocationError ? error.reason : "unavailable";
  if (reason === "denied") {
    return "Location is off. Search for a city, or turn it on in your browser settings.";
  }
  if (reason === "unsupported") {
    return "Location is not available in this browser. Search for a city instead.";
  }
  return "We could not find your location. Try again or search for a city.";
}