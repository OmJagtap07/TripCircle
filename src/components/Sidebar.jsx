import React from 'react';

// src/components/Sidebar.jsx
const Sidebar = ({ places }) => {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Trip Cover Image Placeholder */}
      <div className="h-48 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
        <div className="absolute bottom-4 left-6 text-white">
          <h2 className="text-3xl font-bold shadow-sm">Tokyo Trip</h2>
          <p className="opacity-90">Oct 12 - Oct 18</p>
        </div>
      </div>

      {/* Itinerary List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 uppercase tracking-wider">Itinerary</h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">Optimize Route</button>
        </div>

        {places.map((place) => (
          <div key={place.id} className="relative pl-8 border-l-2 border-blue-100 pb-6 last:pb-0">
            {/* The Dot on the timeline */}
            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-blue-600 rounded-full border-4 border-white"></div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all group">
               <h4 className="font-bold text-gray-800 group-hover:text-blue-600">{place.name}</h4>
               <p className="text-sm text-gray-500 mt-1">{place.note}</p>
               <div className="mt-3 flex gap-2">
                 <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold uppercase text-gray-400">Add Note</span>
                 <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold uppercase text-gray-400">Reservations</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;