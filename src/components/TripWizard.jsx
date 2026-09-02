import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, getDocs } from 'firebase/firestore';
import { createTripGroupChat } from '../services/chatService';
import { fetchCoordinates } from '../utils/geocode';
import { addTripMember } from '../services/tripService';
import { sendInvitations } from '../services/invitationService';
import { fetchDestinationPhoto, triggerUnsplashDownload } from '../services/unsplashService';

const TripWizard = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    dates: '',
    visibility: 'public'
  });
  const [selectedInvites, setSelectedInvites] = useState([]);

  useEffect(() => {
    if (isOpen && user && formData.visibility === 'invite') {
      fetchFollowers();
    }
  }, [isOpen, user, formData.visibility]);

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const followerIds = userDoc.data().followers || [];
        if (followerIds.length > 0) {
          // In a real app, you'd batch this or keep it in a separate collection,
          // but for now we fetch all users and filter (as per existing codebase pattern).
          const usersSnap = await getDocs(collection(db, 'users'));
          const f = usersSnap.docs
            .map(d => ({ uid: d.id, ...d.data() }))
            .filter(u => followerIds.includes(u.uid));
          setFollowers(f);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleInvite = (uid) => {
    setSelectedInvites(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to create a trip!");
      return;
    }

    try {
      setLoading(true);

      const coords = await fetchCoordinates(formData.location);
      
      // Fetch dynamic cover photo
      const coverImage = await fetchDestinationPhoto(formData.location || formData.name);
      
      if (coverImage && coverImage.downloadLocation) {
        triggerUnsplashDownload(coverImage.downloadLocation);
      }

      const newTrip = {
        name: formData.name,
        location: formData.location,
        budget: Number(formData.budget),
        dateRange: formData.dates,
        visibility: formData.visibility,
        
        creatorId: user.uid, 
        creatorName: user.name || "Anonymous",
        tags: ["Community"],
        
        ...(coords && { coordinates: coords }),
        coverImage, // Save the Unsplash photo object
        
        createdAt: serverTimestamp()
      };

      // 1. Create Trip
      const docRef = await addDoc(collection(db, "trips"), newTrip);
      
      // 2. Add creator as tripMember
      await addTripMember(docRef.id, user.uid, 'creator');
      
      // 3. Auto-create Group Chat
      await createTripGroupChat(docRef.id, formData.name, user, []);

      // 4. Send Invitations if invite-only
      if (formData.visibility === 'invite' && selectedInvites.length > 0) {
        await sendInvitations({ id: docRef.id, ...newTrip }, user, selectedInvites);
      }
      
      setFormData({ name: '', location: '', budget: '', dates: '', visibility: 'public' });
      setSelectedInvites([]);
      setLoading(false);
      onClose();
      alert("Trip Created Successfully! ✈️");

    } catch (error) {
      console.error("Error creating trip: ", error);
      alert("Error saving trip. Check console.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2">✕</button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Create New Trip</h2>
          <p className="text-gray-500 text-sm">Where are we going next?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trip Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Goa with College Friends" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-orange-500 outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destination</label>
            <input type="text" name="location" required value={formData.location} onChange={handleChange} placeholder="e.g. Manali, India" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-orange-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dates</label>
              <input type="text" name="dates" required value={formData.dates} onChange={handleChange} placeholder="e.g. Dec 25 - Jan 1" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget (₹)</label>
              <input type="number" name="budget" required value={formData.budget} onChange={handleChange} placeholder="5000" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-orange-500 outline-none font-medium">
              <option value="public">🌍 Public (Anyone can join)</option>
              <option value="followers">👥 Followers Only (Only your followers)</option>
              <option value="invite">✉️ Invite Only (Private)</option>
            </select>
          </div>

          {formData.visibility === 'invite' && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-4">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Invite Followers</h3>
              {loadingFollowers ? (
                <div className="text-xs text-gray-400">Loading followers...</div>
              ) : followers.length === 0 ? (
                <div className="text-xs text-gray-400">You don't have any followers to invite yet.</div>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {followers.map(f => (
                    <div key={f.uid} onClick={() => toggleInvite(f.uid)} className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedInvites.includes(f.uid) ? 'bg-orange-100 border border-orange-200' : 'bg-white border border-gray-200 hover:bg-gray-100'}`}>
                      <img src={f.avatar || `https://ui-avatars.com/api/?name=${f.name}`} alt={f.name} className="w-8 h-8 rounded-full mr-3" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{f.name}</p>
                      </div>
                      <div className="shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedInvites.includes(f.uid) ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                          {selectedInvites.includes(f.uid) && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center mt-4">
            {loading ? "Creating Trip..." : "🚀 Launch Trip Plan"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripWizard;