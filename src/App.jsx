import React, { useState } from 'react';

// --- IMPORTS ---
import Header from './Components/Header';
import Hero from './Components/Hero';
import Categories from './Components/Categories';
import TrendingDestinations from './Components/TrendingDestinations';
import SpecialDeals from './Components/SpecialDeals'; 
import MapTeaser from './Components/MapTeaser';
import CategorySpotlight from './Components/CategorySpotlight'; 
import TripWizard from './Components/TripWizard';
import Login from './Components/Login'; 
import Features from './Components/Features';
import DestinationDetails from './Components/DestinationDetails';
import "./index.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Navigation State
  const [view, setView] = useState("home");
  const [searchedDestination, setSearchedDestination] = useState("");

  // --- 1. MOCK DATA ---
  const myFriends = ["Rohan", "Sarah", "Raj", "Simran", "Amit"];

  // --- 2. THE MASTER DATA ---
  const allTrips = [
    { 
      id: 1, 
      name: "Andaman Group Trip",
      creator: "Rohan's Group", 
      location: "ANDAMAN", 
      budget: 65000, 
      img: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?q=80&w=600",
      members: ["Rohan", "Rahul", "Simran"], 
      tags: ["Beach", "Relax"],
      avatar: "https://ui-avatars.com/api/?name=Rohan&background=random",
      dateRange: "Dec 20 - Dec 28"
    },
    { 
      id: 2, 
      name: "Thailand Roadtrip",
      creator: "Sarah & Friends", 
      location: "THAILAND", 
      budget: 90000, 
      img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600",
      members: ["Sarah", "Mike", "Jenny"], 
      tags: ["Adventure", "Party"],
      avatar: "https://ui-avatars.com/api/?name=Sarah&background=random",
      dateRange: "Jan 10 - Jan 18"
    },
    { 
      id: 3, 
      name: "Manali Solo",
      creator: "Piyush Jagtap", 
      location: "MANALI", 
      budget: 25000, 
      img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600",
      members: ["Piyush"], 
      tags: ["Solo", "Backpacking", "Nature"],
      avatar: "https://ui-avatars.com/api/?name=Piyush&background=0ea5e9&color=fff",
      dateRange: "Flexible Dates"
    },
    { 
      id: 4, 
      name: "College Gang Goes Goa",
      creator: "College Gang", 
      location: "GOA", 
      budget: 8000, 
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuzrClgpj5cu2eSZpwNv31CuJcSd1mIBlIMg&s",
      members: ["Raj", "Simran", "Amit", "Neha", "Pooja"], 
      tags: ["Party", "Budget Friendly"],
      avatar: "https://ui-avatars.com/api/?name=College&background=random",
      dateRange: "Nov 12 - Nov 16"
    },
    { 
      id: 5, 
      name: "Kashmir Trek",
      creator: "Amit Kumar", 
      location: "KASHMIR", 
      budget: 12000, 
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ7Zq8VsFXo_g5rYlxWARpQXoVclMgYdhz_w&s",
      members: ["Amit"], 
      tags: ["Trek", "Nature", "Adventure"],
      avatar: "https://ui-avatars.com/api/?name=Amit&background=random",
      dateRange: "Mar 1 - Mar 7"
    },
    { 
      id: 6, 
      name: "Gujarat Exploration",
      creator: "Cultural Club", 
      location: "GUJARAT", 
      budget: 5000, 
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVUdePkDD2k2rkE3LFuUmEPty8vNO4Z0z-aA&s",
      members: ["Ajay", "Vijay"],
      tags: ["Culture", "Road Trip"],
      avatar: "https://ui-avatars.com/api/?name=Culture&background=random",
      dateRange: "Feb 14 - Feb 18"
    },
    { 
      id: 7, 
      name: "Tokyo Explorer",
      creator: "Japan Lovers", 
      location: "JAPAN", 
      budget: 120000, 
      img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600",
      members: ["Rohan", "Amit"], 
      tags: ["Culture", "City"],
      avatar: "https://ui-avatars.com/api/?name=Japan",
      dateRange: "Apr 5 - Apr 15"
    }
  ];

  // --- 3. FILTERING LOGIC ---
  const getFilteredTrips = () => {
    switch(selectedCategory) {
      case "friends":
        return allTrips.filter(trip => {
          const commonFriends = trip.members.filter(member => myFriends.includes(member));
          return commonFriends.length > 0;
        });
      case "solo":
        return allTrips.filter(trip => trip.members.length === 1);
      case "group":
        return allTrips.filter(trip => trip.members.length >= 2);
      case "budget":
        return allTrips.filter(trip => trip.budget <= 15000);
      case "adventure":
        return allTrips.filter(trip => 
          trip.tags.some(tag => ["Adventure", "Trek", "Nature", "Road Trip"].includes(tag))
        );
      default: 
        return allTrips;
    }
  };

  // --- 4. SPOTLIGHT LOGIC ---
  const getSpotlightData = () => {
    switch (selectedCategory) {
      case 'friends':
        const friendTrip = allTrips.find(t => t.id === 1); 
        return {
          trip: friendTrip,
          badgeText: "Friends Trip",
          subtitle: <span className="text-orange-300 font-bold">3 of your friends are part of this trip!</span>,
          extraInfo: (
            <div className="flex -space-x-3 mt-2">
              {friendTrip.members.map((m, i) => (
                 <img key={i} src={`https://ui-avatars.com/api/?name=${m}&background=random`} className="w-8 h-8 rounded-full border border-gray-900" alt={m}/>
              ))}
            </div>
          )
        };

      case 'solo':
        const soloTrip = allTrips.find(t => t.id === 3);
        return {
          trip: soloTrip,
          badgeText: "Solo Adventure",
          subtitle: "Rated ⭐ 4.9/5 for Safety by solo travelers.",
          extraInfo: null
        };

      case 'budget':
        const budgetTrip = allTrips.find(t => t.id === 4);
        return {
          trip: budgetTrip,
          badgeText: "Budget Steal",
          subtitle: "Save ₹5,000 compared to regular tour packages.",
          extraInfo: <span className="text-green-400 font-bold text-sm bg-green-900/50 px-2 py-1 rounded">💰 40% Cheaper</span>
        };
      
      case 'adventure':
        const advTrip = allTrips.find(t => t.id === 5);
        return {
          trip: advTrip,
          badgeText: "Trending Trek",
          subtitle: "High demand! 12 people joined this week.",
          extraInfo: null
        };

      case 'group':
         const groupTrip = allTrips.find(t => t.id === 2);
         return {
           trip: groupTrip,
           badgeText: "Group Bestseller",
           subtitle: "Perfect for large groups. Private bus included.",
           extraInfo: null
         };

      default:
        return null;
    }
  };

  const spotlightData = getSpotlightData();
  
  // --- 5. HANDLERS ---
  const handleLogin = (userData) => { setUser(userData); setShowLogin(false); };
  const handleLogout = () => { setUser(null); };

  // --- SEARCH HANDLER ---
  const handleSearch = (term) => {
    setSearchedDestination(term);
    setView("destination"); 
    window.scrollTo(0, 0); 
  };
  
  // --- 6. RENDER LOGIC ---

  if (showLogin) return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;

  return (
    <div className="min-h-screen bg-white">
      
      <Header 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
        onLogout={handleLogout}
      />
      
      {/* VIEW LOGIC */}
      {view === "destination" ? (
         // --- DESTINATION VIEW ---
         <>
            <DestinationDetails 
                destinationName={searchedDestination}
                onBack={() => setView("home")}
                allTrips={allTrips}
                myFriends={myFriends}
                
                // 🔥 THIS WAS THE MISSING LINE! 🔥
                // We are passing the function to open the modal
                onPlanTrip={() => setIsModalOpen(true)}
            />
         </>
      ) : (
        // --- HOME VIEW ---
        <>
          <Hero onSearch={handleSearch} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 space-y-16 pb-20">
             <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
             
             {selectedCategory === 'all' ? (
                <MapTeaser />
             ) : (
                <CategorySpotlight 
                  trip={spotlightData?.trip}
                  badgeText={spotlightData?.badgeText}
                  subtitle={spotlightData?.subtitle}
                  extraInfo={spotlightData?.extraInfo}
                />
             )}
             
             <SpecialDeals trips={getFilteredTrips()} myFriends={myFriends} category={selectedCategory} />
             
             <TrendingDestinations />
             <Features />
          </div>
        </>
      )}

      {/* --- IMPORTANT: The Modal must be OUTSIDE the view condition --- */}
      {/* This ensures it can open on BOTH the Home Page and Destination Page */}
      <TripWizard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Floating Button */}
      <button onClick={() => user ? setIsModalOpen(true) : setShowLogin(true)} className="fixed bottom-8 right-8 z-50 bg-white shadow-2xl rounded-full px-6 py-3 flex items-center space-x-2 border border-orange-100 hover:scale-105 transition-transform">
        <span className="text-orange-500 font-bold">{user ? "✈️ Plan Your Trip" : "🔒 Login to Plan"}</span>
      </button>

    </div>
  );
}

export default App;