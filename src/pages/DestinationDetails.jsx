import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SpecialDeals from '../components/SpecialDeals'; 
import { searchDestinationPhotos, triggerUnsplashDownload } from '../services/unsplashService';

// 1. ADD 'onPlanTrip' TO THE PROPS HERE
const DestinationDetails = ({ allTrips, myFriends, onPlanTrip, user, onJoin, onMessageGroup }) => {
  const { name: destinationName } = useParams();
  const navigate = useNavigate();
  const onBack = () => navigate(-1);

  const [unsplashPhotos, setUnsplashPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  
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

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoadingPhotos(true);
      const photos = await searchDestinationPhotos(destinationName, 4);
      setUnsplashPhotos(photos);
      setLoadingPhotos(false);
    };
    fetchPhotos();
  }, [destinationName]);

  const handlePhotoClick = (photo) => {
    triggerUnsplashDownload(photo.downloadLocation);
  };

  if (loadingPhotos) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exploring {destinationName}...</h2>
        <p className="text-gray-500 animate-pulse">Fetching the best travel spots and images.</p>
      </div>
    );
  }

  const isCompletelyEmpty = !loadingPhotos && relatedTrips.length === 0 && unsplashPhotos.length === 0;

  if (isCompletelyEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl p-8 text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            🌍
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">No destination found for "{destinationName}"</h1>
          <p className="text-gray-500 mb-8">
            We couldn't find any trips, itineraries, or photo galleries for this location. Try searching for a valid city, region, or country.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors"
            >
              Search Another Destination
            </button>
            <button 
              onClick={onPlanTrip}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 rounded-xl font-bold transition-colors"
            >
              Create a Trip for this Place
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white animate-in slide-in-from-right duration-300">
      
      {/* 🟢 SECTION 1: DESTINATION OVERVIEW */}
      <div className="relative h-[400px] w-full">
        <img 
          src={unsplashPhotos.length > 0 ? unsplashPhotos[0].imageUrl : data.coverImage} 
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
            onJoin={onJoin}
            user={user}
            onMessageGroup={onMessageGroup} 
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

        {/* 🟢 SECTION 4: DESTINATION GALLERY */}
        {unsplashPhotos.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Destination Gallery</h2>
                <p className="text-gray-500">Inspiring views from {data.name}.</p>
              </div>
              <button className="text-orange-600 font-bold hover:underline">View on Unsplash →</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
              {unsplashPhotos.map((photo, idx) => (
                <div 
                  key={photo.id || idx} 
                  className={`relative rounded-2xl overflow-hidden group cursor-pointer ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img src={idx === 0 ? photo.imageUrl : photo.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={photo.title}/>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    {photo.locationName && (
                      <p className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                        {photo.locationName}
                      </p>
                    )}
                    <h3 className={`font-bold leading-tight ${idx === 0 ? 'text-2xl mb-2' : 'text-sm mb-1'} line-clamp-2`}>{photo.title}</h3>
                    {photo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {photo.tags.map(tag => (
                          <span key={tag} className="text-[10px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unsplash Attribution */}
                  <div 
                    className="absolute top-3 right-3 text-[9px] text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Photo by <a href={photo.photographerProfile} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">{photo.photographerName}</a> on <a href={photo.unsplashHome} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Unsplash</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default DestinationDetails;