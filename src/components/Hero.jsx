import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPlaces } from '../services/geoService';

// 1. I HAVE PUT THE DATA BACK HERE!
const slides = [
  {
    id: 1,
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/15/69/16/australia.jpg?w=1400&h=1400&s=1",
    title: "Australia"
  },
  {
    id: 2,
    image: "https://assets.voxcity.com/uploads/blog_images/why%20dubai%20is%20the%20perfect%20destination%20for%20every%20traveler_original.jpg",
    title: "Dubai"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2000",
    title: "Japan"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2000",
    title: "New York"
  }
];

const Hero = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000); 

    return () => clearInterval(timer);
  }, []);

  // Autocomplete Logic (Debounced)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchText.trim().length >= 3) {
        setIsSearching(true);
        const results = await searchPlaces(searchText);
        setSuggestions(results);
        setIsSearching(false);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText]);

  // Click Outside logic to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Logic
  const handleSearchAction = () => {
    if (searchText.trim().length >= 3) {
      setShowSuggestions(false);
      navigate(`/destination/${encodeURIComponent(searchText.trim())}`);
    }
  };

  const handleSuggestionClick = (place) => {
    setSearchText(place.name);
    setShowSuggestions(false);
    navigate(`/destination/${encodeURIComponent(place.name)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchAction();
    }
  };

  return (
    <div className="relative h-[500px] w-full bg-black">
      
      {/* 1. BACKGROUND IMAGES */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img 
            src={slide.image} 
            className="w-full h-full object-cover"
            alt={slide.title}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* 2. FOREGROUND CONTENT */}
      <div className="relative z-40 flex flex-col items-center justify-center h-full text-white text-center px-4 pointer-events-none">
        
        {/* TEXT ANIMATION SECTION */}
        <div className="relative h-20 w-full flex justify-center items-center mb-2 overflow-hidden">
          {slides.map((slide, index) => (
            <h2
              key={slide.id}
              className={`absolute text-4xl md:text-5xl font-serif italic transition-all duration-1000 ease-in-out transform ${
                index === currentIndex 
                  ? "opacity-100 translate-y-0"   // Visible
                  : "opacity-0 translate-y-10"    // Hidden
              }`}
            >
              Explore {slide.title} with Friends
            </h2>
          ))}
        </div>

        {/* SUBTITLE */}
        <p className="text-xl font-bold tracking-wide uppercase mt-2">
          See where your network is traveling right now.
        </p>

        {/* SEARCH BAR (Cleaned Up) */}
        <div ref={searchContainerRef} className="mt-8 w-full max-w-2xl bg-white rounded-full p-2 flex items-center shadow-2xl relative pointer-events-auto">
          
          <div className="pl-6 flex items-center flex-1">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Where do you want to go?" 
              className="w-full border-none focus:ring-0 text-gray-800 text-lg px-4 outline-none font-medium"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
          </div>

          {/* SEARCH BUTTON (Now Orange & Solo) */}
          <div className="p-1">
            <button 
              onClick={handleSearchAction}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-bold text-sm shadow-md transition-colors"
            >
              Search
            </button>
          </div>

          {/* AUTOCOMPLETE DROPDOWN */}
          {showSuggestions && (searchText.trim().length >= 3) && (
            <div className="absolute top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-gray-400 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  Searching places...
                </div>
              ) : suggestions.length > 0 ? (
                <ul className="max-h-64 overflow-y-auto">
                  {suggestions.map((place, idx) => (
                    <li 
                      key={idx}
                      className="px-6 py-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors text-left"
                      onClick={() => handleSuggestionClick(place)}
                    >
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="text-gray-900 font-bold">{place.name}</p>
                        <p className="text-xs text-gray-500">{place.label}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-gray-500 text-sm text-center">
                  No places found. Try a different city or country.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* DOTS NAVIGATION */}
        <div className="absolute bottom-8 flex space-x-2 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                idx === currentIndex ? "bg-white w-6" : "bg-white/50"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default Hero;