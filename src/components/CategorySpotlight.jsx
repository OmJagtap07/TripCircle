import React from 'react';

const CategorySpotlight = ({ trip, badgeText, subtitle, extraInfo }) => {
  // Safety check: if no trip data is passed, don't break the page
  if (!trip) return null;

  return (
    <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-xl border border-gray-100 group cursor-pointer my-8 animate-in fade-in zoom-in duration-500">
      
      {/* 1. Background Image */}
      <img 
        src={trip.img} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        alt={trip.location}
      />
      
      {/* 2. Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>

      {/* 3. The Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 max-w-2xl">
        
        {/* Top Badge (Dynamic) */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
            {badgeText || "Featured Trip"}
          </span>
          <span className="text-gray-300 text-xs font-medium">
            Happening in {trip.location}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
          {trip.name}
        </h2>

        {/* Dynamic Subtitle/Description */}
        <p className="text-white text-sm md:text-base font-medium opacity-90">
          {subtitle}
        </p>

        {/* Extra Info (Like Avatars or Ratings) */}
        <div className="mt-2">
          {extraInfo}
        </div>

        {/* CTA Button */}
        <div className="mt-6 flex items-center space-x-4">
          <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg flex items-center gap-2">
            View Details <span>→</span>
          </button>
          <span className="text-white font-bold text-lg">
            ₹{trip.budget.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/person</span>
          </span>
        </div>

      </div>
    </div>
  );
};

export default CategorySpotlight;