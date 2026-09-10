import React from 'react';

const FindHotelsButton = ({ destination }) => {
  const handleFindHotels = () => {
    if (!destination) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Hotels in " + destination)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleFindHotels}
      className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full font-bold shadow-sm hover:shadow-md transition-all border border-blue-100"
      title={`Find Hotels in ${destination || 'Destination'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
      Find Hotels in {destination}
    </button>
  );
};

export default FindHotelsButton;
