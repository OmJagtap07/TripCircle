import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, InfoWindow, useGoogleMap } from '@react-google-maps/api';
import { calculateDistance } from '../utils/geo';

const INDIA_CENTER = { lat: 22.5937, lng: 78.9629 };
const defaultMapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  mapId: 'TRIPCIRCLE_MAP_ID', // Required for AdvancedMarkerElement
};

const libraries = ['places', 'marker'];

const AdvancedMarker = ({ position, onClick, title, pinConfig }) => {
  const map = useGoogleMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    let content = null;
    if (pinConfig) {
      const pin = new window.google.maps.marker.PinElement(pinConfig);
      content = pin.element;
    }

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title,
        content,
      });

      if (onClick) {
        markerRef.current.addListener('click', onClick);
      }
    } else {
      markerRef.current.position = position;
      if (content) markerRef.current.content = content;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, position.lat, position.lng, title]);

  return null;
};

const GoogleMapView = ({ trips, user, onJoin, filteredTrips, searchedPlace, setSearchedPlace }) => {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
    libraries,
    version: 'weekly',
  });

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-xl max-w-md border border-red-200 shadow-sm">
          <p className="text-3xl mb-3">🗺️❌</p>
          Google Maps could not be loaded. Please check your API configuration.
        </div>
      </div>
    );
  }

  const [map, setMap] = useState(null);
  const [mapType, setMapType] = useState('roadmap'); // 'roadmap' or 'satellite'
  const [userLocation, setUserLocation] = useState(null);
  const [isLiveLocation, setIsLiveLocation] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedSearchedPlace, setSelectedSearchedPlace] = useState(null);
  const watchIdRef = useRef(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  // Map controls
  const handleZoomIn = () => map?.setZoom(map?.getZoom() + 1);
  const handleZoomOut = () => map?.setZoom(map?.getZoom() - 1);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          map?.panTo(loc);
          map?.setZoom(15);
        },
        handleGeoError
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleGeoError = (error) => {
    console.error("Geolocation error:", error);
    if (error.code === 1) {
      alert("Location access denied. Please allow location access in your browser to use this feature.");
    } else if (error.code === 2) {
      alert("Location is unavailable right now. Please try again later.");
    } else {
      alert("Unable to fetch location. Please check your device settings.");
    }
  };

  useEffect(() => {
    if (isLiveLocation) {
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(loc);
          },
          (error) => {
            setIsLiveLocation(false);
            handleGeoError(error);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isLiveLocation]);

  // Pan to searched place when it changes
  useEffect(() => {
    if (searchedPlace && map) {
      map.panTo({ lat: searchedPlace.lat, lng: searchedPlace.lng });
      map.setZoom(15);
      setSelectedSearchedPlace(searchedPlace);
    }
  }, [searchedPlace, map]);

  const handleDirections = (trip) => {
    if (userLocation) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${trip.coordinates.lat},${trip.coordinates.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${trip.coordinates.lat},${trip.coordinates.lng}`, '_blank');
    }
  };

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading Google Maps. Please check your API key.</div>;
  }

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      <GoogleMap
        mapContainerStyle={defaultMapContainerStyle}
        center={INDIA_CENTER}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          ...mapOptions,
          mapTypeId: mapType,
        }}
        onClick={() => {
          setSelectedTrip(null);
          setSelectedSearchedPlace(null);
        }}
      >
        {/* User Location Marker */}
        {userLocation && (
          <AdvancedMarker
            position={userLocation}
            title="You are here"
            pinConfig={{
              background: '#3b82f6',
              borderColor: '#ffffff',
              glyphColor: '#ffffff'
            }}
          />
        )}

        {/* Trip Markers */}
        {filteredTrips.map((trip) => (
          <AdvancedMarker
            key={trip.id}
            position={{ lat: trip.coordinates.lat, lng: trip.coordinates.lng }}
            onClick={() => setSelectedTrip(trip)}
            pinConfig={{
              background: '#ea580c', // Default TripCircle orange
              borderColor: '#ffffff',
              glyphColor: '#ffffff'
            }}
          />
        ))}

        {/* Info Window for Selected Trip */}
        {selectedTrip && (
          <InfoWindow
            position={{ lat: selectedTrip.coordinates.lat, lng: selectedTrip.coordinates.lng }}
            onCloseClick={() => setSelectedTrip(null)}
          >
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '0px', width: '260px' }}>
              {(selectedTrip.coverImage || selectedTrip.img) && (
                <div style={{ margin: '-12px -12px 12px -12px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={selectedTrip.coverImage?.thumbnailUrl || selectedTrip.coverImage?.imageUrl || selectedTrip.img}
                    alt={selectedTrip.location || selectedTrip.title}
                    style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}

              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', lineHeight: '1.3' }}>
                {selectedTrip.title || selectedTrip.location}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
                  📍 {selectedTrip.location}
                </p>
                {userLocation && (
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#ea580c' }}>
                    {calculateDistance(userLocation.lat, userLocation.lng, selectedTrip.coordinates.lat, selectedTrip.coordinates.lng).toFixed(1)} km away
                  </span>
                )}
              </div>

              {selectedTrip.tags && selectedTrip.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {selectedTrip.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} style={{ fontSize: '10px', fontWeight: '600', color: '#6366f1', background: '#eef2ff', padding: '3px 8px', borderRadius: '20px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/trip/${selectedTrip.id}`)}
                    style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', color: '#fff', background: '#ea580c', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    View Trip
                  </button>
                  {user && selectedTrip.creatorId !== user.uid && (
                    <button
                      onClick={() => onJoin && onJoin(selectedTrip.id)}
                      style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', color: user && selectedTrip.members?.includes(user.uid) ? '#dc2626' : '#4f46e5', background: user && selectedTrip.members?.includes(user.uid) ? '#fef2f2' : '#eef2ff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {user && selectedTrip.members?.includes(user.uid) ? 'Leave' : 'Add to Trip'}
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleDirections(selectedTrip)}
                  style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: '700', color: '#374151', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Get Directions
                </button>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Searched Place Marker */}
        {searchedPlace && (
          <AdvancedMarker
            position={{ lat: searchedPlace.lat, lng: searchedPlace.lng }}
            onClick={() => setSelectedSearchedPlace(searchedPlace)}
            pinConfig={{
              background: '#10b981', // Emerald green
              borderColor: '#ffffff',
              glyphColor: '#ffffff'
            }}
          />
        )}

        {/* Info Window for Searched Place */}
        {selectedSearchedPlace && (
          <InfoWindow
            position={{ lat: selectedSearchedPlace.lat, lng: selectedSearchedPlace.lng }}
            onCloseClick={() => setSelectedSearchedPlace(null)}
          >
            <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '4px', width: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px' }}>📍</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 2px 0', lineHeight: '1.2' }}>
                    {selectedSearchedPlace.name}
                  </h3>
                </div>
              </div>
              {selectedSearchedPlace.formatted_address && (
                <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  {selectedSearchedPlace.formatted_address}
                </p>
              )}
              {userLocation && (
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', margin: '0 0 12px 0' }}>
                  {calculateDistance(userLocation.lat, userLocation.lng, selectedSearchedPlace.lat, selectedSearchedPlace.lng).toFixed(1)} km from you
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    setSearchedPlace(null);
                    setSelectedSearchedPlace(null);
                  }}
                  style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: '700', color: '#4b5563', background: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col pointer-events-auto">
          <button onClick={() => setMapType('roadmap')} className={`px-4 py-2 text-xs font-bold text-left transition-colors ${mapType === 'roadmap' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            🗺️ Standard
          </button>
          <div className="h-px bg-gray-200 w-full" />
          <button onClick={() => setMapType('satellite')} className={`px-4 py-2 text-xs font-bold text-left transition-colors ${mapType === 'satellite' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            🛰️ Satellite
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col pointer-events-auto mt-2">
          <button onClick={handleMyLocation} className="p-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors" title="My Location">
            📍
          </button>
          <div className="h-px bg-gray-200 w-full" />
          <button onClick={() => setIsLiveLocation(!isLiveLocation)} className={`p-3 text-xs font-bold transition-colors ${isLiveLocation ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`} title="Live Location">
            📡 {isLiveLocation ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col pointer-events-auto mt-2">
          <button onClick={handleZoomIn} className="p-3 text-gray-600 hover:bg-gray-50 font-bold" title="Zoom In">➕</button>
          <div className="h-px bg-gray-200 w-full" />
          <button onClick={handleZoomOut} className="p-3 text-gray-600 hover:bg-gray-50 font-bold" title="Zoom Out">➖</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col pointer-events-auto mt-2">
           <button onClick={toggleFullscreen} className="p-3 text-gray-600 hover:bg-gray-50 font-bold" title="Fullscreen">⛶</button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapView;
