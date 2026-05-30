import React from 'react';
import SpecialDeals from './SpecialDeals'; 

// 1. ADD 'onPlanTrip' TO THE PROPS HERE
const DestinationDetails = ({ destinationName, onBack, allTrips, myFriends, onPlanTrip }) => {
  
  // --- 1. THE MOCK DATABASE ---
  const destinationsDB = {
    "japan": {
      name: "Japan",
      country: "East Asia",
      tagline: "Land of the Rising Sun, sushi, and cherry blossoms.",
      coverImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2000",
      friendsVisiting: 4,
      friendsPlanning: 2,
      posts: [
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
        "https://images.unsplash.com/photo-1528164344705-47542687000d?w=400",
        "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=400"
      ]
    },
    "new york": {
      name: "New York",
      country: "USA",
      tagline: "The city that never sleeps. Explore the concrete jungle.",
      coverImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000",
      friendsVisiting: 12,
      friendsPlanning: 5,
      posts: [
        "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400",
        "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=400",
        "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=400"
      ]
    },
    "goa": {
      name: "Goa",
      country: "India",
      tagline: "Sun, Sand, and Spices. The ultimate party destination.",
      coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfX7yW7MV5rUGo4LFs_hm3FXkfHTbCqh81ag&s",
      friendsVisiting: 8,
      friendsPlanning: 10,
      posts: [
        "https://images.unsplash.com/photo-1589330273594-fade1ee91647?w=400",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuzrClgpj5cu2eSZpwNv31CuJcSd1mIBlIMg&s",
        "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=400"
      ]
    },
    "paris": {
      name: "Paris",
      country: "France",
      tagline: "The city of love, art, and fashion.",
      coverImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuvQvwHcd--iw7pYrtiur8rb9NrY61NNUQdw&s",
      friendsVisiting: 2,
      friendsPlanning: 1,
      posts: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShrf16TWyrWrVs2gisuUdrHILn39-KeHrVAg&s",
        "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuvQvwHcd--iw7pYrtiur8rb9NrY61NNUQdw&s"
      ]
    },
    // DEFAULT FALLBACK
    "default": {
      name: destinationName,
      country: "Global Destination",
      tagline: "Explore trips, experiences, and plans created by your network.",
      coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000",
      friendsVisiting: 0,
      friendsPlanning: 0,
      posts: [
         "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400",
         "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400",
         "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"
      ]
    }
  };

  // --- 2. SELECT THE RIGHT DATA ---
  const searchKey = destinationName?.toLowerCase();
  const data = destinationsDB[searchKey] || destinationsDB["default"];

  // Filter trips that match this destination
  const relatedTrips = allTrips.filter(t => 
    t.location.toLowerCase().includes(destinationName.toLowerCase()) || 
    t.name.toLowerCase().includes(destinationName.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-right duration-300">
      
      {/* 🟢 SECTION 1: DESTINATION OVERVIEW */}
      <div className="relative h-[400px] w-full">
        <img 
          src={data.coverImage} 
          className="w-full h-full object-cover" 
          alt={data.name} 
        />
        <div className="absolute inset-0 bg-black/40"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-8 left-8 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2"
        >
          ← Back to Home
        </button>

        <div className="absolute bottom-10 left-8 md:left-16 text-white max-w-3xl">
          <span className="bg-orange-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            {data.country}
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-2">{data.name}</h1>
          <p className="text-xl md:text-2xl font-medium opacity-90">{data.tagline}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* 🟢 SECTION 2: FRIENDS ACTIVITY */}
        <section className="bg-orange-50 rounded-3xl p-8 border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              {myFriends.slice(0, 4).map((friend, i) => (
                <img 
                  key={i} 
                  src={`https://ui-avatars.com/api/?name=${friend}&background=random`} 
                  className="w-12 h-12 rounded-full border-4 border-white" 
                  alt={friend} 
                />
              ))}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Your network is active here!</h3>
              <p className="text-gray-600">
                <span className="font-bold text-orange-600">{data.friendsVisiting} friends</span> have visited • 
                <span className="font-bold text-orange-600"> {data.friendsPlanning}</span> planning a trip
              </p>
            </div>
          </div>
          <button className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md transition-all border border-orange-100">
            Ask for Recommendations 💬
          </button>
        </section>

        {/* 🟢 SECTION 3: TRIPS RELATED TO THIS DESTINATION */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-6">Available Plans for {data.name}</h2>
          <SpecialDeals 
            trips={relatedTrips} 
            myFriends={myFriends} 
            category="all" 
          />
          {relatedTrips.length === 0 && (
             <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
               <p className="text-gray-500">
                 No public itineraries found for {data.name} yet. 
                 
                 {/* 2. ATTACH THE ONCLICK EVENT HERE! */}
                 <span 
                   onClick={onPlanTrip}
                   className="text-orange-600 font-bold cursor-pointer ml-1 hover:underline"
                 >
                   Be the first to create one!
                 </span>
               </p>
             </div>
          )}
        </div>

        {/* 🟢 SECTION 4: EXPERIENCES */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-black text-gray-900">Experiences</h2>
              <p className="text-gray-500">Captured moments from your circle in {data.name}.</p>
            </div>
            <button className="text-orange-600 font-bold hover:underline">View all posts →</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
            <div className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
               <img src={data.posts[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="post 1"/>
               <div className="absolute bottom-4 left-4 flex items-center gap-2">
                 <img src="https://ui-avatars.com/api/?name=Rohan" className="w-8 h-8 rounded-full border border-white" alt="user"/>
                 <span className="text-white font-bold text-sm bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">Rohan in {data.name}</span>
               </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
               <img src={data.posts[1]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="post 2"/>
            </div>
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
               <img src={data.posts[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="post 3"/>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DestinationDetails;