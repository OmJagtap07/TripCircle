export const searchPlaces = async (query) => {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&osm_tag=place`);
    
    if (!response.ok) {
      console.error('Geo API failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      return data.features.map(feature => {
        const { name, country, state, city } = feature.properties;
        
        // Construct a clean label like "Berlin, Germany" or "Goa, India"
        let labelParts = [name];
        if (city && city !== name) labelParts.push(city);
        if (state && state !== name && state !== city) labelParts.push(state);
        if (country) labelParts.push(country);
        
        // Remove duplicates and join
        const uniqueLabelParts = [...new Set(labelParts)].filter(Boolean);

        return {
          name: name || query,
          country: country || null,
          label: uniqueLabelParts.join(', ')
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
};
