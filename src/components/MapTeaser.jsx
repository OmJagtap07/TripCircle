import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMapView from './GoogleMapView';

const MapTeaser = ({ trips = [], user, onJoin }) => {
  const navigate = useNavigate();

  // Filter trips that have valid coordinates
  const geoTrips = useMemo(() => {
    return trips.filter(
      (trip) =>
        trip.coordinates &&
        typeof trip.coordinates.lat === 'number' &&
        typeof trip.coordinates.lng === 'number'
    );
  }, [trips]);

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-xl border border-gray-100 group">
      
      {/* 1. The Google Map Component */}
      <div className="absolute inset-0 z-0">
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <GoogleMapView trips={trips} filteredTrips={geoTrips} user={user} onJoin={onJoin} />
        ) : (
           <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000" 
            className="w-full h-full object-cover opacity-80"
            alt="World Map Fallback"
          />
        )}
      </div>
      
      {/* 2. The Overlay Content - pointer-events-none allows map interaction underneath */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent flex items-center p-8 md:p-12 pointer-events-none z-10">
        <div className="max-w-lg space-y-4">
          <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-sm">
            LIVE FEATURE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg">
            Visualise your network's <br/> travels on the <span className="text-orange-400">Global Map</span>.
          </h2>
          <p className="text-gray-300 text-lg font-medium drop-shadow-md">
            See where {trips.length > 0 ? trips.length : 'your'} trips are currently happening.
          </p>
          
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/map'); }} 
            className="mt-4 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2 pointer-events-auto shadow-xl"
          >
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9 7" /></svg>
            Open Full Interactive Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapTeaser;