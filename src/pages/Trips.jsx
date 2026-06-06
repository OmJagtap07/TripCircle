import React from 'react';
import { useNavigate } from 'react-router-dom';

const Trips = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-black text-gray-900 mb-4">All Trips</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Discover and browse all the amazing trips created by the TripCircle community. Coming soon!
      </p>
      <button 
        onClick={() => navigate('/')}
        className="bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-700 hover:scale-105 transition-all"
      >
        Back to Home
      </button>
    </div>
  );
};

export default Trips;
