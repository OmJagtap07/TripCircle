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

// FIREBASE IMPORTS
import { auth, db, googleProvider, signInWithPopup, signOut, doc, setDoc } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc } from "firebase/firestore"; 
import "./index.css";

function App() {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null); 
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [view, setView] = useState("home");
  const [searchedDestination, setSearchedDestination] = useState("");
  
  // NEW: State for User Trips
  const [myTrips, setMyTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // --- 1. AUTH LISTENER ---
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

  // --- 2. HANDLERS ---
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
      await setDoc(doc(db, "users", loggedUser.uid), userData, { merge: true });
      setUser(userData);
      setShowLogin(false);
    } catch (error) {
      console.error("Login Failed:", error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setView("home");
  };

  // --- 3. FETCH USER TRIPS ---
  const handleMyTripsClick = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setLoadingTrips(true);
    setView("my-trips"); // Switch to My Trips view
    
    try {
      // Query: Give me trips where 'creatorId' matches the logged-in user
      const q = query(collection(db, "trips"), where("creatorId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const userTrips = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // IMPORTANT: Fallback image if the trip doesn't have one yet
          img: data.img || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800"
        };
      });

      setMyTrips(userTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteDoc(doc(db, "trips", tripId));
        setMyTrips(prev => prev.filter(trip => trip.id !== tripId));
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
    }
  };

  const handleSearch = (term) => {
    setSearchedDestination(term);
    setView("destination"); 
    window.scrollTo(0, 0); 
  };
  
  // --- 4. MOCK DATA (For Home Page) ---
  const myFriends = ["Rohan", "Sarah", "Raj", "Simran", "Amit"];
  
  const allTrips = [
    { id: 1, name: "Andaman Group Trip", creator: "Rohan's Group", location: "ANDAMAN", budget: 65000, img: "https://images.unsplash.com/photo-1589330273594-fade1ee91647?q=80&w=600", members: ["Rohan", "Rahul", "Simran"], tags: ["Beach", "Relax"], avatar: "https://ui-avatars.com/api/?name=Rohan&background=random", dateRange: "Dec 20 - Dec 28" },
    { id: 2, name: "Thailand Roadtrip", creator: "Sarah & Friends", location: "THAILAND", budget: 90000, img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=600", members: ["Sarah", "Mike", "Jenny"], tags: ["Adventure", "Party"], avatar: "https://ui-avatars.com/api/?name=Sarah&background=random", dateRange: "Jan 10 - Jan 18" },
    { id: 3, name: "Manali Solo", creator: "Piyush Jagtap", location: "MANALI", budget: 25000, img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600", members: ["Piyush"], tags: ["Solo", "Backpacking", "Nature"], avatar: "https://ui-avatars.com/api/?name=Piyush&background=0ea5e9&color=fff", dateRange: "Flexible Dates" },
    { id: 4, name: "College Gang Goes Goa", creator: "College Gang", location: "GOA", budget: 8000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuzrClgpj5cu2eSZpwNv31CuJcSd1mIBlIMg&s", members: ["Raj", "Simran", "Amit", "Neha", "Pooja"], tags: ["Party", "Budget Friendly"], avatar: "https://ui-avatars.com/api/?name=College&background=random", dateRange: "Nov 12 - Nov 16" },
    { id: 5, name: "Kashmir Trek", creator: "Amit Kumar", location: "KASHMIR", budget: 12000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ7Zq8VsFXo_g5rYlxWARpQXoVclMgYdhz_w&s", members: ["Amit"], tags: ["Trek", "Nature", "Adventure"], avatar: "https://ui-avatars.com/api/?name=Amit&background=random", dateRange: "Mar 1 - Mar 7" },
    { id: 6, name: "Gujarat Exploration", creator: "Cultural Club", location: "GUJARAT", budget: 5000, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVUdePkDD2k2rkE3LFuUmEPty8vNO4Z0z-aA&s", members: ["Ajay", "Vijay"], tags: ["Culture", "Road Trip"], avatar: "https://ui-avatars.com/api/?name=Culture&background=random", dateRange: "Feb 14 - Feb 18" },
    { id: 7, name: "Tokyo Explorer", creator: "Japan Lovers", location: "JAPAN", budget: 120000, img: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600", members: ["Rohan", "Amit"], tags: ["Culture", "City"], avatar: "https://ui-avatars.com/api/?name=Japan", dateRange: "Apr 5 - Apr 15" }
  ];

  // --- FILTERING ---
  const getFilteredTrips = () => {
    switch(selectedCategory) {
      case "friends": return allTrips.filter(trip => trip.members.some(member => myFriends.includes(member)));
      case "solo": return allTrips.filter(trip => trip.members.length === 1);
      case "group": return allTrips.filter(trip => trip.members.length >= 2);
      case "budget": return allTrips.filter(trip => trip.budget <= 15000);
      case "adventure": return allTrips.filter(trip => trip.tags.some(tag => ["Adventure", "Trek", "Nature", "Road Trip"].includes(tag)));
      default: return allTrips;
    }
  };

  const getSpotlightData = () => {
    switch (selectedCategory) {
      case 'friends': return { trip: allTrips[0], badgeText: "Friends Trip", subtitle: <span className="text-orange-300 font-bold">3 of your friends are part of this trip!</span>, extraInfo: <div className="flex -space-x-3 mt-2">{allTrips[0].members.map((m, i) => <img key={i} src={`https://ui-avatars.com/api/?name=${m}&background=random`} className="w-8 h-8 rounded-full border border-gray-900" alt={m}/>)}</div> };
      case 'solo': return { trip: allTrips[2], badgeText: "Solo Adventure", subtitle: "Rated ⭐ 4.9/5 for Safety.", extraInfo: null };
      case 'budget': return { trip: allTrips[3], badgeText: "Budget Steal", subtitle: "Save ₹5,000 compared to packages.", extraInfo: <span className="text-green-400 font-bold text-sm bg-green-900/50 px-2 py-1 rounded">💰 40% Cheaper</span> };
      case 'adventure': return { trip: allTrips[4], badgeText: "Trending Trek", subtitle: "High demand! 12 people joined.", extraInfo: null };
      case 'group': return { trip: allTrips[1], badgeText: "Group Bestseller", subtitle: "Private bus included.", extraInfo: null };
      default: return null;
    }
  };
  const spotlightData = getSpotlightData();

  // --- RENDER ---
  if (showLogin) return <Login onLogin={handleGoogleLogin} onBack={() => setShowLogin(false)} />;

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header with My Trips Handler */}
      <Header 
        user={user} 
        onLoginClick={() => setShowLogin(true)} 
        onLogout={handleLogout}
        onMyTripsClick={handleMyTripsClick} 
      />
      
      {/* --- VIEW SWITCHER --- */}
      {view === "destination" ? (
        <DestinationDetails 
          destinationName={searchedDestination}
          onBack={() => setView("home")}
          allTrips={allTrips}
          myFriends={myFriends}
          onPlanTrip={() => setIsModalOpen(true)}
        />
      ) : view === "my-trips" ? (
         
         // --- MY TRIPS VIEW ---
         <div className="max-w-7xl mx-auto px-4 py-10 min-h-[60vh]">
            <button onClick={() => setView("home")} className="mb-6 text-gray-500 hover:text-orange-500 font-bold">← Back to Home</button>
            <h1 className="text-3xl font-black text-gray-900 mb-2">My Trips ✈️</h1>
            <p className="text-gray-500 mb-8">Itineraries you have created.</p>

            {loadingTrips ? (
              <div className="text-center py-20 text-gray-400 animate-pulse">Loading your adventures...</div>
            ) : myTrips.length > 0 ? (
               // Reuse your EXISTING SpecialDeals component!
               // Note: We are passing 'onDelete', but if your reverted SpecialDeals component 
               // doesn't have the delete logic yet, it will just ignore this prop. That is SAFE.
               <SpecialDeals 
                  trips={myTrips} 
                  myFriends={[]} 
                  category="my-trips" 
                  onDelete={handleDeleteTrip} 
               />
            ) : (
               <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-xl text-gray-400 font-bold mb-4">You haven't created any trips yet.</p>
                  <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition">
                    Plan your first trip now
                  </button>
               </div>
            )}
         </div>

      ) : (
        // --- HOME VIEW (Unchanged Logic) ---
        <>
          <Hero onSearch={handleSearch} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 space-y-16 pb-20">
             <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
             {selectedCategory === 'all' && <MapTeaser />}
             {selectedCategory !== 'all' && <CategorySpotlight {...spotlightData} />}
             <SpecialDeals trips={getFilteredTrips()} myFriends={myFriends} category={selectedCategory} />
             <TrendingDestinations />
             <Features />
          </div>
        </>
      )}

      {/* Modal with User Prop */}
      <TripWizard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />

      {/* Floating Button */}
      {view !== "my-trips" && (
        <button onClick={() => user ? setIsModalOpen(true) : setShowLogin(true)} className="fixed bottom-8 right-8 z-50 bg-white shadow-2xl rounded-full px-6 py-3 flex items-center space-x-2 border border-orange-100 hover:scale-105 transition-transform">
          <span className="text-orange-500 font-bold">{user ? "✈️ Plan Your Trip" : "🔒 Login to Plan"}</span>
        </button>
      )}
    </div>
  );
}

export default App;