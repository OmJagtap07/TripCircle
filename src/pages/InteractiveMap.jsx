import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Fix for missing default marker icons in Leaflet + React ---
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- India Center Coordinates ---
const INDIA_CENTER = [22.5937, 78.9629];
const INDIA_ZOOM = 5;

const InteractiveMap = ({ trips = [], loading = false, user, onJoin }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter trips that have valid coordinates
  const geoTrips = useMemo(() => {
    return trips.filter(
      (trip) =>
        trip.coordinates &&
        typeof trip.coordinates.lat === 'number' &&
        typeof trip.coordinates.lng === 'number'
    );
  }, [trips]);

  // Search/filter within geo trips
  const filteredTrips = useMemo(() => {
    if (!searchQuery.trim()) return geoTrips;
    const q = searchQuery.toLowerCase();
    return geoTrips.filter(
      (trip) =>
        (trip.title && trip.title.toLowerCase().includes(q)) ||
        (trip.location && trip.location.toLowerCase().includes(q))
    );
  }, [geoTrips, searchQuery]);

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

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trips on map..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- Map Area --- */}
      <div className="flex-1 relative" style={{ minHeight: 'calc(100vh - 160px)' }}>
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
            <MapContainer
              center={INDIA_CENTER}
              zoom={INDIA_ZOOM}
              scrollWheelZoom={true}
              className="h-full w-full"
              style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredTrips.map((trip) => (
                <Marker
                  key={trip.id}
                  position={[trip.coordinates.lat, trip.coordinates.lng]}
                >
                  <Popup minWidth={260} maxWidth={320}>
                    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '4px 0' }}>
                      {/* Trip Image */}
                      {trip.img && (
                        <div style={{ margin: '-4px -20px 12px -20px', overflow: 'hidden', borderRadius: '0' }}>
                          <img
                            src={trip.img}
                            alt={trip.location}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </div>
                      )}

                      {/* Trip Title */}
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: '#111827',
                        margin: '0 0 2px 0',
                        lineHeight: '1.3',
                      }}>
                        {trip.title || trip.location}
                      </h3>

                      {/* Location */}
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: '0 0 10px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        📍 {trip.location}
                      </p>

                      {/* Stats Row */}
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '12px',
                        padding: '8px 10px',
                        background: '#f9fafb',
                        borderRadius: '10px',
                        border: '1px solid #f3f4f6',
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Budget
                          </span>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#ea580c', margin: '2px 0 0 0' }}>
                            ₹{trip.budget ? trip.budget.toLocaleString() : '—'}
                          </p>
                        </div>
                        <div style={{ width: '1px', background: '#e5e7eb' }} />
                        <div>
                          <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Members
                          </span>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '2px 0 0 0' }}>
                            {trip.members?.length || 0}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      {trip.tags && trip.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {trip.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: '#6366f1',
                                background: '#eef2ff',
                                padding: '3px 8px',
                                borderRadius: '20px',
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleViewTrip(trip.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#ffffff',
                            background: 'linear-gradient(135deg, #ea580c, #f97316)',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                          View Trip
                        </button>

                        {user && trip.creatorId !== user.uid && (
                          <button
                            onClick={() => handleJoinTrip(trip.id)}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: '700',
                              color: user && trip.members?.includes(user.uid) ? '#dc2626' : '#4f46e5',
                              background: user && trip.members?.includes(user.uid) ? '#fef2f2' : '#eef2ff',
                              border: `1px solid ${user && trip.members?.includes(user.uid) ? '#fecaca' : '#c7d2fe'}`,
                              borderRadius: '10px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            {user && trip.members?.includes(user.uid) ? 'Leave' : 'Join Trip'}
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

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

            {/* Search yielded no results overlay */}
            {geoTrips.length > 0 && filteredTrips.length === 0 && searchQuery.trim() && (
              <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-8 max-w-sm mx-4 text-center pointer-events-auto">
                  <p className="text-4xl mb-3">🔍</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No matching trips</h3>
                  <p className="text-gray-500 text-sm">
                    No trips match "<span className="font-semibold">{searchQuery}</span>". Try a different search.
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
