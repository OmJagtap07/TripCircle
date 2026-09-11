import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import GoogleMapView from '../components/GoogleMapView';

// --- India Center Coordinates ---
const INDIA_CENTER = [22.5937, 78.9629];
const INDIA_ZOOM = 5;

const libraries = ['places', 'marker'];

const InteractiveMap = ({ trips = [], loading = false, user, onJoin }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedPlace, setSearchedPlace] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const autocompleteContainerRef = useRef(null);
  const placeAutocompleteRef = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
    version: 'weekly',
  });

  // Filter trips that have valid coordinates
  const geoTrips = useMemo(() => {
    return trips.filter(
      (trip) =>
        trip.coordinates &&
        typeof trip.coordinates.lat === 'number' &&
        typeof trip.coordinates.lng === 'number'
    );
  }, [trips]);

  // Search/filter within geo trips (Only local filtering if they didn't use Places autocomplete)
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim() || searchedPlace) return geoTrips;
    const q = searchQuery.toLowerCase();
    return geoTrips.filter(
      (trip) =>
        (trip.title && trip.title.toLowerCase().includes(q)) ||
        (trip.location && trip.location.toLowerCase().includes(q))
    );
  }, [geoTrips, searchQuery, searchedPlace]);

  useEffect(() => {
    if (isLoaded && autocompleteContainerRef.current && !placeAutocompleteRef.current) {
      const autocomplete = new window.google.maps.places.PlaceAutocompleteElement();
      
      // Basic styling for the web component
      autocomplete.style.width = '100%';
      autocomplete.style.height = '100%';
      autocomplete.style.display = 'block';
      autocomplete.style.backgroundColor = 'transparent';
      autocomplete.style.border = 'none';

      autocompleteContainerRef.current.appendChild(autocomplete);
      placeAutocompleteRef.current = autocomplete;

      autocomplete.addEventListener('gmp-placeselect', async (e) => {
        const place = e.place;
        if (!place) return;
        
        setSearchError(null);
        try {
          await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
          
          if (place.location) {
            setSearchedPlace({
              name: place.displayName,
              formatted_address: place.formattedAddress,
              lat: typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat,
              lng: typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng
            });
            setSearchQuery(place.displayName || place.formattedAddress || '');
          } else {
            setSearchError('No coordinates found for this location.');
            setSearchedPlace(null);
          }
        } catch (error) {
          console.error('Error fetching place details:', error);
          setSearchError('Unable to retrieve place details.');
        }
      });
    }
  }, [isLoaded]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchedPlace(null);
    setSearchError(null);
    if (placeAutocompleteRef.current) {
      // Clear the internal input of the web component if possible
      try {
        placeAutocompleteRef.current.value = '';
      } catch (e) {
        console.error('Error clearing autocomplete', e);
      }
    }
  };

  const handleViewTrip = (tripId) => {
    navigate(`/trip/${tripId}`);
  };

  const handleJoinTrip = (tripId) => {
    if (onJoin) onJoin(tripId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ paddingTop: '80px' }}>
      {/* --- Top Bar --- */}
      <div className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-orange-500 font-bold transition-colors text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Home
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 7" />
                </svg>
                Interactive Map
              </h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {filteredTrips.length} trip{filteredTrips.length !== 1 ? 's' : ''} on the map
              </p>
            </div>
          </div>

          {/* Global Styles for the Web Component Inner Elements */}
          <style dangerouslySetInnerHTML={{__html: `
            gmp-place-picker {
              width: 100%;
            }
          `}} />
          
          {/* Search */}
          <div className="relative w-full sm:w-80 flex items-center bg-gray-50 border border-gray-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-orange-300 focus-within:border-orange-300 px-3 py-2">
            <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
            <div className="flex-1 min-w-0" ref={autocompleteContainerRef} style={{ minHeight: '24px' }}>
              {!isLoaded && <span className="text-gray-400 text-sm">Loading search...</span>}
            </div>

            {searchQuery && (
              <button
                onClick={clearSearch}
                className="ml-2 p-1 flex-shrink-0 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                title="Clear Search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- Map Area --- */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 160px)', minHeight: '400px' }}>
        {loading ? (
          /* Loading State */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 font-semibold text-lg">Loading map data...</p>
            <p className="text-gray-400 text-sm mt-1">Discovering trips across India</p>
          </div>
        ) : (
          <>
            <GoogleMapView 
              trips={trips} 
              filteredTrips={filteredTrips} 
              user={user} 
              onJoin={onJoin} 
              searchedPlace={searchedPlace} 
              setSearchedPlace={(place) => {
                setSearchedPlace(place);
                if (!place) setSearchQuery('');
              }} 
            />

            {/* Empty State Overlay (when no trips have coordinates) */}
            {geoTrips.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-md mx-4 text-center pointer-events-auto">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No trips on the map yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    No trips are currently available on the map. Trips will appear here once they have location coordinates.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  >
                    Browse Trips
                  </button>
                </div>
              </div>
            )}

            {/* Search error overlay */}
            {searchError && (
              <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-sm mx-4 text-center pointer-events-auto">
                  <p className="text-4xl mb-3">🌍</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No places found</h3>
                  <p className="text-gray-500 text-sm">
                    {searchError}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
