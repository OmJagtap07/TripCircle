import React from 'react';

// Added 'onDelete' prop
const SpecialDeals = ({ trips, myFriends, category, onDelete }) => {
  
  // --- SMART LAYOUT DETECTOR ---
  // This ensures that even in "All Trips" or "My Trips", 
  // a Solo trip still looks like a Solo trip (not generic).
  const getLayoutType = (trip) => {
    // 1. If user selected a specific filter button, respect it.
    if (category !== 'all' && category !== 'my-trips') return category;

    // 2. Otherwise, auto-detect the best layout based on tags/data
    const tags = trip.tags || [];
    if (tags.includes('Solo')) return 'solo';
    if (tags.includes('Budget Friendly') || trip.budget <= 10000) return 'budget';
    if (tags.some(t => ['Adventure', 'Trek'].includes(t))) return 'adventure';
    if (tags.includes('Party') || (trip.members && trip.members.length > 3)) return 'group';
    
    // 3. Default fallback
    return 'friends';
  };

  // This function decides exactly what to render inside the card footer
  const renderCardContent = (trip) => {
    const layoutType = getLayoutType(trip);
    const tripTags = trip.tags || [];

    // ------------------------------------------
    // 2️⃣ SOLO PLANS LAYOUT
    // ------------------------------------------
    if (layoutType === 'solo') {
      return (
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-black uppercase tracking-wide">{trip.location}</h3>
                <p className="text-sm text-gray-300 font-medium">by {trip.creator || trip.creatorName}</p>
             </div>
             <span className="bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase border border-gray-600">
               {tripTags[0] || 'Solo'}
             </span>
          </div>
          <div className="mt-3 flex justify-between items-end border-t border-white/20 pt-2">
             <span className="text-xl font-bold">₹{(trip.budget || 0).toLocaleString()}</span>
             <button className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-bold hover:bg-gray-200">
               Join Solo
             </button>
          </div>
        </div>
      );
    }

    // ------------------------------------------
    // 3️⃣ GROUP TRIPS LAYOUT
    // ------------------------------------------
    if (layoutType === 'group') {
      return (
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-black tracking-wide">{trip.name}</h3>
          
          <div className="flex items-center space-x-2 mt-1 mb-2">
             <span className="text-xs bg-orange-500 px-1.5 py-0.5 rounded font-bold">{(trip.members || []).length} Members</span>
             <span className="text-xs text-gray-300">• {trip.dateRange}</span>
          </div>

          <div className="flex justify-between items-center border-t border-white/20 pt-2">
             <div className="flex flex-col">
                <span className="text-sm font-bold">₹{(trip.budget || 0).toLocaleString()}<span className="text-[10px] font-normal opacity-70">/person</span></span>
             </div>
             <button className="text-xs bg-orange-600 text-white px-4 py-1.5 rounded-full font-bold hover:bg-orange-700">
               Request Join
             </button>
          </div>
        </div>
      );
    }

    // ------------------------------------------
    // 4️⃣ BUDGET FRIENDLY LAYOUT
    // ------------------------------------------
    if (layoutType === 'budget') {
      return (
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="absolute -top-12 right-0">
             <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-l-full shadow-lg">
               Budget Friendly
             </span>
          </div>
          
          <h3 className="text-2xl font-black uppercase tracking-wide">{trip.location}</h3>
          
          <div className="mt-2 bg-white/10 backdrop-blur-md rounded-xl p-2 flex justify-between items-center border border-white/10">
             <div>
                <p className="text-[10px] text-green-300 font-bold uppercase">Total Cost</p>
                <p className="text-xl font-bold text-white">₹{(trip.budget || 0).toLocaleString()}</p>
             </div>
             <button className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-600">
               View Deal
             </button>
          </div>
        </div>
      );
    }

    // ------------------------------------------
    // 5️⃣ ADVENTURE LAYOUT
    // ------------------------------------------
    if (layoutType === 'adventure') {
      return (
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-2xl font-black uppercase tracking-wide mb-2">{trip.location}</h3>
          
          <div className="flex flex-wrap gap-1 mb-3">
             {tripTags.map((tag, i) => (
               <span key={i} className="text-[10px] uppercase font-bold text-white bg-orange-500/80 px-2 py-0.5 rounded">
                 {tag}
               </span>
             ))}
          </div>

          <div className="flex justify-between items-center border-t border-white/20 pt-2">
             <span className="text-xs font-medium text-gray-300">
               {(trip.members || []).length === 1 ? "👤 Solo Expedition" : "👥 Group Expedition"}
             </span>
             <button className="text-xs border border-white text-white px-3 py-1.5 rounded-full font-bold hover:bg-white hover:text-black transition-colors">
               Explore
             </button>
          </div>
        </div>
      );
    }

    // ------------------------------------------
    // DEFAULT / FRIENDS LAYOUT
    // ------------------------------------------
    const friendsOnTrip = myFriends ? (trip.members || []).filter(m => myFriends.includes(m)) : [];
    return (
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-xl font-black uppercase tracking-wide">{trip.location || trip.name}</h3>
        
        <div className="flex justify-between items-end mt-2">
          <div className="text-xs pr-2">
            {friendsOnTrip.length > 0 ? (
              <span className="text-orange-400 font-bold">
                {friendsOnTrip.length} of your friends are going!
              </span>
            ) : (
              <span className="text-gray-300">{(trip.members || []).length} Travelers joining</span>
            )}
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-lg font-bold">₹{(trip.budget || 0).toLocaleString()}</span>
             <button className="text-[10px] bg-white text-black px-3 py-1 rounded-full font-bold hover:bg-gray-200 mt-1">
              View Plan
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER COMPONENT ---
  return (
    <section className="py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {category === 'all' || category === 'my-trips' ? 'Community Trips' : `${category} Trips`}
          </h2>
          <p className="text-gray-500 text-sm">
            {trips.length} active trips found.
          </p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">No trips found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {trips.map((trip) => (
            <div 
              key={trip.id} 
              className="relative group overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all h-full"
            >
              {/* Image */}
              <img 
                src={trip.img} 
                alt={trip.location} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

              {/* Creator Avatar (Top Left) */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <img src={trip.avatar || `https://ui-avatars.com/api/?name=${trip.creatorName || 'User'}`} className="w-8 h-8 rounded-full border border-white" alt="user" />
                <span className="text-white text-xs font-bold shadow-black drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                   {trip.creator || trip.creatorName || "User"}
                </span>
              </div>

              {/* 🔥 NEW: DELETE BUTTON (Top Right) 🔥 */}
              {/* This only shows up if 'onDelete' is passed (e.g. on My Trips page) */}
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    onDelete(trip.id);
                  }}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-red-500 text-white p-2 rounded-full border border-white/30 transition-all z-20 hover:scale-110"
                  title="Delete Trip"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}

              {/* DYNAMIC FOOTER CONTENT */}
              {renderCardContent(trip)}
              
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SpecialDeals;