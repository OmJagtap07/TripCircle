import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const TripDetails = ({ trips = [], user, onJoin, onMessageGroup }) => {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Trip not found!</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-700 transition"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const isJoined = user && trip.members && trip.members.includes(user.uid);
  const isCreator = user && trip.creatorId === user.uid;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-gray-500 hover:text-orange-500 font-bold flex items-center gap-2"
        >
          ← Back
        </button>
        
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="h-64 sm:h-80 relative">
            <img src={trip.img} alt={trip.location} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">{trip.location}</h1>
              <div className="flex gap-2 flex-wrap">
                {trip.tags.map((tag, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold border border-white/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-3xl font-black text-orange-600">₹{trip.budget.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Est. Budget / Person</p>
              </div>
              
              <div className="flex gap-3">
                {isJoined ? (
                   <button 
                     onClick={() => onMessageGroup(trip.id)}
                     className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
                   >
                     💬 Open Group Chat
                   </button>
                ) : null}
                
                {!isCreator && (
                  <button 
                    onClick={() => onJoin(trip.id)}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${
                      isJoined 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        : 'bg-orange-600 text-white hover:bg-orange-700 hover:scale-105'
                    }`}
                  >
                    {isJoined ? 'Leave Trip' : 'Join Trip'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Trip Details</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {trip.notes || "No details provided for this trip yet."}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Members ({trip.members?.length || 0})</h3>
                {trip.members?.length > 0 ? (
                  <p className="text-gray-600">
                    This trip currently has {trip.members.length} member(s).
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No one has joined yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
