import React, { useState } from 'react';
import { db } from '../firebase'; // Connect to database
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore actions

const TripWizard = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  
  // 1. STATE TO HOLD INPUTS
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    dates: '',
    guests: '1'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 2. SAVE TO FIREBASE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to create a trip!");
      return;
    }

    try {
      setLoading(true);

      // Create the trip object
      const newTrip = {
        name: formData.name,
        location: formData.location,
        budget: Number(formData.budget),
        dateRange: formData.dates,
        guests: Number(formData.guests),
        
        // Tagging the creator so we can find it later
        creatorId: user.uid, 
        creatorName: user.name || "Anonymous",
        members: [user.uid], // You are the first member
        tags: ["Community"], // Default tag (we can make this dynamic later)
        
        createdAt: serverTimestamp()
      };

      // Send to "trips" collection
      await addDoc(collection(db, "trips"), newTrip);
      
      // Success!
      setFormData({ name: '', location: '', budget: '', dates: '', guests: '1' });
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
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-2"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">Create New Trip</h2>
          <p className="text-gray-500 text-sm">Where are we going next?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trip Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Goa with College Friends" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Destination</label>
            <input 
              type="text" 
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Manali, India" 
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dates</label>
              <input 
                type="text" 
                name="dates"
                required
                value={formData.dates}
                onChange={handleChange}
                placeholder="e.g. Dec 25 - Jan 1" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget (₹)</label>
              <input 
                type="number" 
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                placeholder="5000" 
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center mt-4"
          >
            {loading ? "Creating Trip..." : "🚀 Launch Trip Plan"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default TripWizard;