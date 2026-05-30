import React from 'react';

const categories = [
  { id: "all", name: "All Trips", icon: "🌏" },
  { id: "friends", name: "Friends Trips", icon: "👯‍♀️" },
  { id: "solo", name: "Solo Adventure", icon: "🎒" },
  { id: "budget", name: "Budget Friendly", icon: "💸" },
  { id: "group", name: "Group Trips", icon: "🚌" }, // Added Group explicitly
  { id: "adventure", name: "Adventure", icon: "⛰️" }, // Changed Road to Adventure
];

const Categories = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex justify-center -mt-8 relative z-20">
      <div className="bg-white p-2 rounded-full shadow-lg flex space-x-2 overflow-x-auto max-w-full no-scrollbar">
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap outline-none
              ${selectedCategory === cat.id 
                ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <span className="text-xl">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;