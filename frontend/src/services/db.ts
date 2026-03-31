const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export interface Stop {
  station: { name: string };
  departure?: string;
  arrival?: string;
  plannedDeparture?: string;
  plannedArrival?: string;
}

export interface Trip {
  origin: Stop;
  destination: Stop;
  departure: string;
  arrival: string;
  durationMinutes: number;
}

/**
 * Fetch trip details from our own backend, which uses hafas-client
 * to talk directly to Deutsche Bahn's HAFAS system.
 */
export async function fetchTrip(from: string, to: string): Promise<Trip> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`${BACKEND_URL}/api/trip?${params}`);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Trip lookup failed (${res.status})`);
  }

  return res.json();
}
