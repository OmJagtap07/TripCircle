/**
 * Utility to fetch coordinates from Nominatim (OpenStreetMap)
 * IMPORTANT: Nominatim allows a maximum of 1 request per second.
 * Respect this limit when calling this function in a loop.
 */

export const fetchCoordinates = async (locationName) => {
  if (!locationName || typeof locationName !== 'string') return null;

  try {
    const query = encodeURIComponent(locationName.trim());
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TripCircle-App/1.0' // Good practice for Nominatim
      }
    });

    if (!response.ok) {
      console.warn(`Geocoding failed for ${locationName}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    
    return null; // No results found
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
