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
import { auth, db, googleProvider, signInWithPopup, signOut, doc, setDoc } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import "./index.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [view, setView] = useState("home");
  const [searchedDestination, setSearchedDestination] = useState("");

  // --- 1. FIREBASE AUTH OBSERVER ---
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL,
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. AUTH HANDLERS ---
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;

      const userData = {
        name: loggedUser.displayName,
        email: loggedUser.email,
        avatar: loggedUser.photoURL,
        uid: loggedUser.uid,
        lastSeen: new Date()
      };

      // Save to Firestore for social features
      await setDoc(doc(db, "users", loggedUser.uid), userData, { merge: true });

      setUser(userData);
      setShowLogin(false);
      console.log("Logged in and synced with Firestore!");
    } catch (error) {
      console.error("Login Failed:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Logout Failed:", error.message);
    }
  };
  
  // --- 3. DATA & SOCIAL CIRCLE ---
  const myFriends = ["Rohan", "Sarah", "Raj", "Simran", "Amit"];
  
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

  // --- 4. LOGIC FUNCTIONS ---
  const getFilteredTrips = () => {
    switch(selectedCategory) {
      case "friends":
        return allTrips.filter(trip => trip.members.some(member => myFriends.includes(member)));
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

  const getSpotlightData = () => {
    const spotlights = {
      friends: { trip: allTrips[0], badge: "Friends Trip", sub: "3 friends are part of this trip!" },
      solo: { trip: allTrips[2], badge: "Solo Adventure", sub: "Rated ⭐ 4.9/5 for Safety." },
      budget: { trip: allTrips[3], badge: "Budget Steal", sub: "💰 40% Cheaper than average." },
      adventure: { trip: allTrips[4], badge: "Trending Trek", sub: "12 people joined this week." },
      group: { trip: allTrips[1], badge: "Group Bestseller", sub: "Private bus included." }
    };
    const data = spotlights[selectedCategory];
    return data ? {
      trip: data.trip,
      badgeText: data.badge,
      subtitle: data.sub,
      extraInfo: selectedCategory === 'friends' ? (
        <div className="flex -space-x-3 mt-2">
          {data.trip.members.map((m, i) => (
             <img key={i} src={`https://ui-avatars.com/api/?name=${m}&background=random`} className="w-8 h-8 rounded-full border border-gray-900" alt={m}/>
          ))}
        </div>
      ) : null
    } : null;
  };

  const spotlightData = getSpotlightData();
  
  const handleSearch = (term) => {
    setSearchedDestination(term);
    setView("destination"); 
    window.scrollTo(0, 0); 
  };
  
  // --- 5. RENDER ---
  if (showLogin) return <Login onLogin={handleGoogleLogin} onBack={() => setShowLogin(false)} />;

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} onLoginClick={() => setShowLogin(true)} onLogout={handleLogout} />
      
      {view === "destination" ? (
        <DestinationDetails 
          destinationName={searchedDestination}
          onBack={() => setView("home")}
          allTrips={allTrips}
          myFriends={myFriends}
          onPlanTrip={() => setIsModalOpen(true)}
        />
      ) : (
        <>
          <Hero onSearch={handleSearch} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 space-y-16 pb-20">
             <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
             {selectedCategory === 'all' ? <MapTeaser /> : (
                <CategorySpotlight {...spotlightData} />
             )}
             <SpecialDeals trips={getFilteredTrips()} myFriends={myFriends} category={selectedCategory} />
             <TrendingDestinations />
             <Features />
          </div>
        </>
      )}

      <TripWizard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <button onClick={() => user ? setIsModalOpen(true) : setShowLogin(true)} className="fixed bottom-8 right-8 z-50 bg-white shadow-2xl rounded-full px-6 py-3 flex items-center space-x-2 border border-orange-100 hover:scale-105 transition-transform">
        <span className="text-orange-500 font-bold">{user ? "✈️ Plan Your Trip" : "🔒 Login to Plan"}</span>
      </button>
    </div>
  );
}

export default App;