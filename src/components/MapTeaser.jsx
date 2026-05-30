import React from 'react';

const MapTeaser = () => {
  return (
    <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-xl border border-gray-100 group cursor-pointer">
      
      {/* 1. The Background Map Image (Static but looks real) */}
      <img 
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000" 
        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
        alt="World Map"
      />
      
      {/* 2. The Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent flex items-center p-8 md:p-12">
        <div className="max-w-lg space-y-4">
          <div className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
            LIVE FEATURE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Visualise your network's <br/> travels on the <span className="text-orange-400">Global Map</span>.
          </h2>
          <p className="text-gray-300 text-lg font-medium">
            See where 12 friends are currently traveling.
          </p>
          
          <button className="mt-4 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7m0 0L9 7" /></svg>
            Open Interactive Map
          </button>
        </div>
      </div>

      {/* 3. Fake "Floating Pins" for visual effect */}
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-500 rounded-full animate-ping"></div>
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
      
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-ping delay-700"></div>
      <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>

    </div>
  );
};

export default MapTeaser;