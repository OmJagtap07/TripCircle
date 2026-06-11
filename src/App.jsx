import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// --- 1. FIREBASE IMPORTS ---
import { auth, db, googleProvider, signInWithPopup, signOut } from './config/firebase';
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  setDoc,
  arrayUnion,
  onSnapshot,
  arrayRemove,
  writeBatch
} from "firebase/firestore";

// --- COMPONENT IMPORTS ---
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import TrendingDestinations from './components/TrendingDestinations';
import SpecialDeals from './components/SpecialDeals';
import MapTeaser from './components/MapTeaser';
import CategorySpotlight from './components/CategorySpotlight';
import TripWizard from './components/TripWizard';
import Login from './pages/Login';
import Features from './components/Features';
import DestinationDetails from './pages/DestinationDetails';
import TripAssistant from './components/TripAssistant';
import UserProfile from './pages/UserProfile';
import Inbox from './pages/Inbox';
import ProtectedRoute from './components/ProtectedRoute';
import TripDetails from './pages/TripDetails';
import Trips from './pages/Trips';
import Settings from './pages/Settings';
import InteractiveMap from './pages/InteractiveMap';
import { getOrCreateDirectChat } from './services/chatService';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 🔥 UNIFIED DATA STATE (Holds ALL trips from Firebase)
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. INITIALIZE & FETCH DATA ---
  React.useEffect(() => {
    // A. Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
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

    // B. Real-time Database Listener
    const q = collection(db, "trips");
    const unsubscribeTrips = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        img: doc.data().img || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800",
        tags: doc.data().tags || ["Community"],
        members: doc.data().members || []
      }));
      setTrips(tripsData);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeTrips();
    };
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
    navigate("/");
  };

  const handleDeleteTrip = async (tripId) => {
    const tripToDelete = trips.find(t => t.id === tripId);
    const tripName = tripToDelete ? tripToDelete.location : "this trip";

    if (window.confirm(`⚠️ WARNING: Are you sure you want to delete "${tripName}"?\n\nThis action cannot be undone and all member data will be lost.`)) {
      try {
        await deleteDoc(doc(db, "trips", tripId));
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("Could not delete. Check console.");
      }
    }
  };

  // --- JOIN / LEAVE TOGGLE LOGIC ---
  const handleJoinTrip = async (tripId) => {
    if (!user) {
      alert("Please login to join this trip!");
      setShowLogin(true);
      return;
    }

    try {
      const targetTrip = trips.find(t => t.id === tripId);
      const isJoined = targetTrip?.members?.includes(user.uid);
      const tripRef = doc(db, "trips", tripId);
      const chatRef = doc(db, "chats", `trip_${tripId}`);
      const batch = writeBatch(db);

      if (isJoined) {
        if (window.confirm("Do you want to leave this trip? 😢")) {
          batch.update(tripRef, { members: arrayRemove(user.uid) });
          batch.update(chatRef, { participantIds: arrayRemove(user.uid) });
          await batch.commit();
        }
      } else {
        batch.update(tripRef, { members: arrayUnion(user.uid) });
        batch.update(chatRef, { 
          participantIds: arrayUnion(user.uid),
          [`participantsData.${user.uid}`]: { name: user.name, avatar: user.avatar || null }
        });
        await batch.commit();
      }

    } catch (error) {
      console.error("Error updating trip:", error);
      alert("Something went wrong. Try again.");
    }
  };

  // --- FILTERING & MOCK DATA HELPERS ---
  const myFriends = ["Rohan", "Sarah", "Raj", "Simran", "Amit"];

  const getFilteredTrips = (showMyTripsOnly = false) => {
    let data = trips;

    if (showMyTripsOnly && user) {
      return trips.filter(t => t.creatorId === user.uid);
    }

    switch (selectedCategory) {
      case "friends": return data.filter(trip => trip.members && trip.members.some(member => myFriends.includes(member)));
      case "solo": return data.filter(trip => trip.tags.includes("Solo"));
      case "group": return data.filter(trip => trip.tags.includes("Party") || trip.members.length >= 2);
      case "budget": return data.filter(trip => trip.tags.includes("Budget Friendly") || trip.budget <= 15000);
      case "adventure": return data.filter(trip => trip.tags.some(tag => ["Adventure", "Trek", "Nature"].includes(tag)));
      default: return data;
    }
  };

  const getSpotlightData = () => {
    if (trips.length === 0) return null;

    const friendsTrip = trips.find(t => t.tags.includes("Party")) || trips[0];
    const soloTrip = trips.find(t => t.tags.includes("Solo")) || trips[1];
    const budgetTrip = trips.find(t => t.tags.includes("Budget Friendly")) || trips[2];
    const adventureTrip = trips.find(t => t.tags.includes("Adventure")) || trips[3];
    const groupTrip = trips.find(t => t.members.length > 2) || trips[4];

    switch (selectedCategory) {
      case 'friends': return { trip: friendsTrip, badgeText: "Friends Trip", subtitle: <span className="text-orange-300 font-bold">Trending in your network!</span>, extraInfo: null };
      case 'solo': return { trip: soloTrip, badgeText: "Solo Adventure", subtitle: "Rated ⭐ 4.9/5 for Safety.", extraInfo: null };
      case 'budget': return { trip: budgetTrip, badgeText: "Budget Steal", subtitle: "Save money compared to packages.", extraInfo: <span className="text-green-400 font-bold text-sm bg-green-900/50 px-2 py-1 rounded">💰 Best Value</span> };
      case 'adventure': return { trip: adventureTrip, badgeText: "Trending Trek", subtitle: "High demand!", extraInfo: null };
      case 'group': return { trip: groupTrip, badgeText: "Group Bestseller", subtitle: "Great for large teams.", extraInfo: null };
      default: return null;
    }
  };
  const spotlightData = getSpotlightData();

  // --- RENDER ---
  if (showLogin) return <Login onLogin={handleGoogleLogin} onBack={() => setShowLogin(false)} />;

  return (
    <div className="min-h-screen bg-white">
      <Header
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      <Routes>
        {/* --- HOME VIEW --- */}
        <Route path="/" element={
          <>
            <Hero />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 space-y-16 pb-20">
              <Categories selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
              {selectedCategory === 'all' && <MapTeaser />}
              {selectedCategory !== 'all' && spotlightData && <CategorySpotlight {...spotlightData} />}

              <SpecialDeals
                trips={getFilteredTrips(false)}
                myFriends={myFriends}
                category={selectedCategory}
                onJoin={handleJoinTrip}
                user={user}
              />

              <TrendingDestinations />
              <Features />
            </div>
          </>
        } />

        <Route path="/destination/:name" element={
          <DestinationDetails
            allTrips={trips}
            myFriends={myFriends}
            onPlanTrip={() => setIsModalOpen(true)}
            user={user}
            onJoin={handleJoinTrip}
          />
        } />

        <Route path="/trips" element={<Trips />} />

        <Route path="/map" element={
          <InteractiveMap
            trips={trips}
            loading={loading}
            user={user}
            onJoin={handleJoinTrip}
          />
        } />
        
        <Route path="/trip/:tripId" element={
          <TripDetails 
            trips={trips} 
            user={user} 
            onJoin={handleJoinTrip} 
            onMessageGroup={(tripId) => navigate(`/inbox/trip_${tripId}`)}
          />
        } />

        <Route path="/my-trips" element={
          <ProtectedRoute user={user}>
            <div className="max-w-7xl mx-auto px-4 py-10 min-h-[60vh]">
              <button onClick={() => navigate("/")} className="mb-6 text-gray-500 hover:text-orange-500 font-bold">← Back to Home</button>
              <h1 className="text-3xl font-black text-gray-900 mb-2">My Trips ✈️</h1>
              <p className="text-gray-500 mb-8">Itineraries you have created.</p>

              {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse">Loading your adventures...</div>
              ) : getFilteredTrips(true).length > 0 ? (
                <SpecialDeals
                  trips={getFilteredTrips(true)}
                  myFriends={[]}
                  category="my-trips"
                  onDelete={handleDeleteTrip}
                  onJoin={handleJoinTrip}
                  user={user}
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
          </ProtectedRoute>
        } />

        <Route path="/profile/:uid" element={
          <UserProfile
            currentUser={user}
            trips={trips}
            onPlanTrip={() => setIsModalOpen(true)}
            onJoin={handleJoinTrip}
          />
        } />

        <Route path="/inbox" element={
          <ProtectedRoute user={user}>
            <Inbox user={user} />
          </ProtectedRoute>
        } />
        
        <Route path="/inbox/:chatId" element={
          <ProtectedRoute user={user}>
            <Inbox user={user} />
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute user={user}>
            <Settings />
          </ProtectedRoute>
        } />
      </Routes>

      {/* MODALS & FLOATING BUTTONS */}
      <TripWizard isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />

      <TripAssistant />

      {location.pathname !== "/my-trips" && (
        <button onClick={() => user ? setIsModalOpen(true) : setShowLogin(true)} className="fixed bottom-8 right-8 z-50 bg-white shadow-2xl rounded-full px-6 py-3 flex items-center space-x-2 border border-orange-100 hover:scale-105 transition-transform">
          <span className="text-orange-500 font-bold">{user ? "✈️ Plan Your Trip" : "🔒 Login to Plan"}</span>
        </button>
      )}
    </div>
  );
}

export default App;