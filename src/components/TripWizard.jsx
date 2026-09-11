import React, { useState, useEffect, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, getDocs } from 'firebase/firestore';
import { createTripGroupChat } from '../services/chatService';
import { fetchCoordinates } from '../utils/geocode';
import { addTripMember } from '../services/tripService';
import { sendInvitations } from '../services/invitationService';
import { fetchDestinationPhoto, searchDestinationPhotos, triggerUnsplashDownload } from '../services/unsplashService';
import { searchPlaces } from '../services/geoService';

const TripWizard = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);

  // Destination autocomplete state
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationContainerRef = useRef(null);

  // Preview image state
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    visibility: 'public'
  });
  const [selectedInvites, setSelectedInvites] = useState([]);

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', location: '', budget: '', startDate: '', endDate: '', visibility: 'public' });
      setLocationInput('');
      setSelectedInvites([]);
      setPreviewPhoto(null);
      setSuggestions([]);
    }
  }, [isOpen]);

  // Fetch followers when visibility changes to 'invite'
  useEffect(() => {
    if (isOpen && user && formData.visibility === 'invite') {
      fetchFollowers();
    }
  }, [isOpen, user, formData.visibility]);

  // Debounced autocomplete for destination
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (locationInput.trim().length >= 3) {
        setIsSearching(true);
        const results = await searchPlaces(locationInput);
        setSuggestions(results);
        setIsSearching(false);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [locationInput]);

  // Click-outside handler for autocomplete
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchFollowers = async () => {
    setLoadingFollowers(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const followerIds = userDoc.data().followers || [];
        if (followerIds.length > 0) {
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

  const handleSuggestionClick = async (place) => {
    setLocationInput(place.name);
    setFormData(prev => ({ ...prev, location: place.name }));
    setShowSuggestions(false);
    setSuggestions([]);

    // Fetch preview image for right panel
    setLoadingPreview(true);
    setPreviewPhoto(null);
    try {
      const photos = await searchDestinationPhotos(place.name, 1);
      if (photos && photos.length > 0) {
        setPreviewPhoto(photos[0]);
      }
    } catch (err) {
      console.error('Error fetching preview photo:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleInvite = (uid) => {
    setSelectedInvites(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to create a trip!');
      return;
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      alert('End date cannot be before start date.');
      return;
    }

    try {
      setLoading(true);
      const coords = await fetchCoordinates(formData.location);

      // Fetch full cover photo for the trip
      const coverImage = await fetchDestinationPhoto(formData.location || formData.name);
      if (coverImage && coverImage.downloadLocation) {
        triggerUnsplashDownload(coverImage.downloadLocation);
      }

      // Build a human-readable date range string
      const dateRange = formData.startDate && formData.endDate
        ? `${new Date(formData.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(formData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : '';

      const newTrip = {
        name: formData.name,
        location: formData.location,
        budget: Number(formData.budget),
        dateRange,
        startDate: formData.startDate,
        endDate: formData.endDate,
        visibility: formData.visibility,
        creatorId: user.uid,
        creatorName: user.name || 'Anonymous',
        tags: ['Community'],
        ...(coords && { coordinates: coords }),
        coverImage,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'trips'), newTrip);
      await addTripMember(docRef.id, user.uid, 'creator');
      await createTripGroupChat(docRef.id, formData.name, user, []);

      if (formData.visibility === 'invite' && selectedInvites.length > 0) {
        await sendInvitations({ id: docRef.id, ...newTrip }, user, selectedInvites);
      }

      setLoading(false);
      onClose();
      alert('Trip Created Successfully! ✈️');
    } catch (error) {
      console.error('Error creating trip: ', error);
      alert('Error saving trip. Check console.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative overflow-hidden" style={{ maxHeight: '92vh' }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row h-full">

          {/* ───────── LEFT COLUMN: FORM ───────── */}
          <div className="md:w-[480px] flex-shrink-0 p-8 overflow-y-auto" style={{ maxHeight: '92vh' }}>
            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-orange-500 text-2xl">✈️</span>
                <h2 className="text-2xl font-black text-gray-900">Plan Your Trip</h2>
              </div>
              <p className="text-gray-400 text-sm">Fill in the details and we'll set everything up.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Trip Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Trip Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Goa with College Friends"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              {/* Destination with Autocomplete */}
              <div ref={locationContainerRef} className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Destination</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      setFormData(prev => ({ ...prev, location: e.target.value }));
                      setShowSuggestions(true);
                    }}
                    placeholder="e.g. Goa, Jaipur, Paris"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  {isSearching && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </span>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && locationInput.trim().length >= 3 && (
                  <div className="absolute top-full mt-1.5 left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {isSearching ? (
                      <div className="p-4 text-gray-400 text-sm text-center">Searching places...</div>
                    ) : suggestions.length > 0 ? (
                      <ul className="max-h-52 overflow-y-auto">
                        {suggestions.map((place, idx) => (
                          <li
                            key={idx}
                            className="px-4 py-3 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => handleSuggestionClick(place)}
                          >
                            <span className="text-orange-500 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                            </span>
                            <div>
                              <p className="text-gray-900 font-bold text-sm">{place.name}</p>
                              <p className="text-xs text-gray-400">{place.label}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-gray-400 text-sm text-center">No places found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    min={formData.startDate || ''}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Budget (₹ per person)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    name="budget"
                    required
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="e.g. 5000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium appearance-none"
                >
                  <option value="public">🌍 Public — Anyone can join</option>
                  <option value="followers">👥 Followers Only</option>
                  <option value="invite">✉️ Invite Only (Private)</option>
                </select>
              </div>

              {/* Invite Followers Panel */}
              {formData.visibility === 'invite' && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h3 className="text-sm font-bold text-orange-700 mb-3">Invite Followers</h3>
                  {loadingFollowers ? (
                    <div className="text-xs text-gray-400 animate-pulse">Loading followers...</div>
                  ) : followers.length === 0 ? (
                    <div className="text-xs text-gray-400">You don't have any followers to invite yet.</div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {followers.map(f => (
                        <div
                          key={f.uid}
                          onClick={() => toggleInvite(f.uid)}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${selectedInvites.includes(f.uid) ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                        >
                          <img src={f.avatar || `https://ui-avatars.com/api/?name=${f.name}`} alt={f.name} className="w-8 h-8 rounded-full mr-3" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{f.name}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedInvites.includes(f.uid) ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                            {selectedInvites.includes(f.uid) && <span className="text-white text-xs font-bold">✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 text-base mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Trip...
                  </>
                ) : (
                  <>🚀 Launch Trip Plan</>
                )}
              </button>
            </form>
          </div>

          {/* ───────── RIGHT COLUMN: PREVIEW ───────── */}
          <div className="hidden md:flex flex-1 relative bg-gray-50 items-center justify-center overflow-hidden rounded-r-3xl">
            {loadingPreview ? (
              /* Loading state */
              <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-sm font-medium">Fetching destination...</p>
              </div>
            ) : previewPhoto ? (
              /* Destination Image Preview */
              <>
                <img
                  src={previewPhoto.imageUrl}
                  alt={formData.location}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-4xl font-black mb-1 drop-shadow-lg">{formData.location}</h3>
                  {previewPhoto.locationName && (
                    <p className="text-sm text-white/80 flex items-center gap-1 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {previewPhoto.locationName}
                    </p>
                  )}
                  <p className="text-[10px] text-white/50">
                    Photo by{' '}
                    <a href={previewPhoto.photographerProfile} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                      {previewPhoto.photographerName}
                    </a>{' '}
                    on{' '}
                    <a href={previewPhoto.unsplashHome} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                      Unsplash
                    </a>
                  </p>
                </div>
              </>
            ) : (
              /* Placeholder state */
              <div className="flex flex-col items-center justify-center text-center px-10 gap-5">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Ready to plan your trip?</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Start by filling out the form on the left. Select a destination from the dropdown and we'll show you a beautiful preview right here.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  {['🏔️', '🏖️', '🗺️', '✈️'].map((emoji, i) => (
                    <span key={i} className="text-2xl opacity-40 hover:opacity-100 transition-opacity">{emoji}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TripWizard;