// src/services/unsplashService.js

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800';

export const fetchDestinationPhoto = async (query) => {
  const fallbackPhoto = {
    imageUrl: DEFAULT_FALLBACK_IMAGE,
    thumbnailUrl: DEFAULT_FALLBACK_IMAGE,
    photographerName: 'Ian Dooley',
    photographerProfile: 'https://unsplash.com/@sadswim?utm_source=tripcircle&utm_medium=referral',
    unsplashHome: 'https://unsplash.com/?utm_source=tripcircle&utm_medium=referral',
    downloadLocation: null
  };

  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('VITE_UNSPLASH_ACCESS_KEY is missing. Using fallback image.');
    return fallbackPhoto;
  }

  try {
    const url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      console.error('Unsplash API failed:', response.statusText);
      return fallbackPhoto;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        imageUrl: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        photographerName: photo.user.name,
        photographerProfile: `${photo.user.links.html}?utm_source=tripcircle&utm_medium=referral`,
        unsplashHome: 'https://unsplash.com/?utm_source=tripcircle&utm_medium=referral',
        downloadLocation: photo.links.download_location
      };
    }
    
    // Fallback if no results
    return fallbackPhoto;

  } catch (error) {
    console.error('Error fetching photo from Unsplash:', error);
    return fallbackPhoto;
  }
};

export const searchDestinationPhotos = async (query, count = 4) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('VITE_UNSPLASH_ACCESS_KEY is missing.');
    return [];
  }

  try {
    const travelQuery = `${query.trim()} travel destination landscape`;
    const url = `https://api.unsplash.com/search/photos?page=1&query=${encodeURIComponent(travelQuery)}&orientation=landscape&per_page=${count}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      console.error('Unsplash API failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results.map(photo => ({
        id: photo.id,
        imageUrl: photo.urls.regular,
        thumbnailUrl: photo.urls.small,
        title: photo.description || photo.alt_description || query,
        description: photo.description || photo.alt_description || "",
        locationName: photo.location?.name || photo.location?.city || photo.location?.country || null,
        tags: photo.tags ? photo.tags.map(t => t.title).slice(0, 4) : [],
        photographerName: photo.user.name,
        photographerProfile: `${photo.user.links.html}?utm_source=tripcircle&utm_medium=referral`,
        unsplashHome: 'https://unsplash.com/?utm_source=tripcircle&utm_medium=referral',
        downloadLocation: photo.links.download_location
      }));
    }
    
    // Fallback if no results
    return [];

  } catch (error) {
    console.error('Error fetching photos from Unsplash:', error);
    return [];
  }
};

export const triggerUnsplashDownload = (downloadLocation) => {
  if (downloadLocation && UNSPLASH_ACCESS_KEY) {
    fetch(`${downloadLocation}&client_id=${UNSPLASH_ACCESS_KEY}`)
      .catch(err => console.error('Failed to trigger Unsplash download:', err));
  }
};