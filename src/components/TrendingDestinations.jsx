import React from 'react';

const destinations = [
  { 
    name: "Europe", 
    img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400",
    friendsVisited: ["PJ", "AK", "RD"], // Initials of friends
    friendCount: 12
  },
  { 
    name: "Kerala", 
    img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400",
    friendsVisited: ["SM", "JD"],
    friendCount: 5
  },
  { 
    name: "Bali", 
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400",
    friendsVisited: ["KP", "RT", "AS", "MJ"],
    friendCount: 8
  },
  { 
    name: "Kashmir", 
    img: "https://res.cloudinary.com/jerrick/image/upload/v1735660808/67741508602bab001da3244e.jpg",
    friendsVisited: ["RK"],
    friendCount: 2
  },
  { 
    name: "Vietnam", 
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
    friendsVisited: ["AB", "CD", "EF"],
    friendCount: 15
  }
];

const TrendingDestinations = () => {
  return (
    <section>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Where are your friends going?</h2>
          <p className="text-gray-500 mt-1">Trending spots in your social network.</p>
        </div>
        <a href="#" className="text-orange-600 font-bold hover:underline">View Global Map →</a>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {destinations.map((item, idx) => (
          <div key={idx} className="group cursor-pointer relative">
            {/* Image Card */}
            <div className="overflow-hidden rounded-2xl aspect-[3/4] mb-3 relative shadow-md">
              <img 
                src={item.img} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={item.name}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Text on Image */}
              <div className="absolute bottom-3 left-3 text-white">
                <h3 className="font-bold text-lg">{item.name}</h3>
              </div>
            </div>

            {/* --- SOCIAL PROOF (The 9.5 Feature) --- */}
            <div className="flex items-center space-x-2">
              {/* Overlapping Avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {item.friendsVisited.map((initial, i) => (
                  <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-orange-100 flex items-center justify-center text-[8px] font-bold text-orange-600">
                    {initial}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                +{item.friendCount} friends been here
              </span>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingDestinations;