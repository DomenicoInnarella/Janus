// Google Places & Maps configuration
export const GOOGLE_PLACES_API_KEY = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY) || 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY) || 
  "AIzaSyALxcr3ncX1dyFhJofpUo9RLnWu6deJKNg";

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
}

// Places autocomplete search for Rome
export async function searchRomePlaces(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    // Attempt geocoding via OpenStreetMap Nominatim with Rome bounding box as fast client fallback
    const viewbox = '12.35,41.78,12.65,42.02'; // Rome metropolitan bounding box
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ', Roma, Italia'
      )}&viewbox=${viewbox}&bounded=1&limit=5&addressdetails=1`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      placeId: String(item.place_id),
      description: item.display_name,
      mainText: item.name || item.address?.road || item.display_name.split(',')[0],
      secondaryText: item.address?.suburb || item.address?.city_district || 'Roma, Italia',
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (err) {
    console.warn('Place search error:', err);
    return [];
  }
}
