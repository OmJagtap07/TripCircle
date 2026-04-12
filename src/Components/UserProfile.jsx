import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    doc, getDoc, updateDoc, collection, getDocs,
    arrayUnion, arrayRemove
} from 'firebase/firestore';

// ── Banner presets ────────────────────────────────────────────────────────────
const BANNER_THEMES = [
    { id: 'orange', label: 'Sunset', className: 'bg-gradient-to-br from-orange-400 via-orange-500 to-rose-500' },
    { id: 'ocean', label: 'Ocean', className: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600' },
    { id: 'forest', label: 'Forest', className: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600' },
    { id: 'aurora', label: 'Aurora', className: 'bg-gradient-to-br from-purple-400 via-pink-500 to-rose-400' },
    { id: 'desert', label: 'Desert', className: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-amber-600' },
    { id: 'night', label: 'Night', className: 'bg-gradient-to-br from-gray-700 via-slate-800 to-gray-900' },
    { id: 'cherry', label: 'Cherry', className: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-500' },
    { id: 'galaxy', label: 'Galaxy', className: 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700' },
];

const getBannerClass = (id) =>
    BANNER_THEMES.find(t => t.id === id)?.className ?? BANNER_THEMES[0].className;

// ── Reusable sub-components ──────────────────────────────────────────────────
const TripCard = ({ trip, onJoin, user, showLeave = true }) => {
    const isJoined = trip.members?.includes(user?.uid);
    return (
        <div className="relative group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-52 cursor-pointer">
            <img src={trip.img} alt={trip.location}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center space-x-2">
                <img src={trip.avatar || `https://ui-avatars.com/api/?name=${trip.creatorName || 'User'}&background=f97316&color=fff`}
                    className="w-7 h-7 rounded-full border-2 border-white object-cover" alt="creator" />
                <span className="text-white text-xs font-bold bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {trip.creator || trip.creatorName || 'User'}
                </span>
            </div>
            <div className="absolute top-3 right-3 flex gap-1">
                {(trip.tags || []).slice(0, 1).map((tag, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold bg-orange-500/90 text-white px-2 py-0.5 rounded-full">{tag}</span>
                ))}
            </div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-black text-lg leading-tight">{trip.location || trip.name}</h3>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-orange-300">₹{(trip.budget || 0).toLocaleString()}</span>
                    {showLeave && onJoin && (
                        <button onClick={(e) => { e.stopPropagation(); onJoin(trip.id); }}
                            className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${isJoined ? 'bg-green-500 text-white hover:bg-red-600' : 'bg-white text-black hover:bg-gray-100'}`}>
                            {isJoined ? 'Joined ✓' : 'Join'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ emoji, title, subtitle, actionLabel, onAction }) => (
    <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <div className="text-5xl mb-3">{emoji}</div>
        <p className="font-bold text-gray-700 text-lg">{title}</p>
        <p className="text-gray-400 text-sm mt-1 mb-4">{subtitle}</p>
        {onAction && (
            <button onClick={onAction} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors">
                {actionLabel}
            </button>
        )}
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const TABS = ['Overview', 'Interested Plans', 'My Trips', 'Following'];

const UserProfile = ({ user, trips, onBack, onPlanTrip, onJoin }) => {
    const [activeTab, setActiveTab] = useState('Overview');

    // Bio
    const [bio, setBio] = useState('');
    const [editingBio, setEditingBio] = useState(false);
    const [bioInput, setBioInput] = useState('');
    const [savingBio, setSavingBio] = useState(false);

    // Banner
    const [bannerId, setBannerId] = useState('orange');
    const [showBannerPicker, setShowBannerPicker] = useState(false);
    const [savingBanner, setSavingBanner] = useState(false);

    // Real users / following
    const [allUsers, setAllUsers] = useState([]);          // every user in Firestore
    const [following, setFollowing] = useState([]);        // UIDs the current user follows
    const [loadingUsers, setLoadingUsers] = useState(true);

    // ── Derived data ─────────────────────────────────────────────────
    const myCreatedTrips = trips.filter(t => t.creatorId === user?.uid);
    const myJoinedTrips = trips.filter(t => t.members?.includes(user?.uid) && t.creatorId !== user?.uid);

    // UIDs I follow that also have a user doc
    const followingUsers = allUsers.filter(u => following.includes(u.uid));

    // Other users I can discover (not me, not already following)
    const discoverUsers = allUsers.filter(u => u.uid !== user?.uid && !following.includes(u.uid));

    // ── Fetch everything from Firestore on mount ─────────────────────
    useEffect(() => {
        if (!user?.uid) return;
        const fetchData = async () => {
            // 1. My user doc (bio, bannerId, following[])
            const mySnap = await getDoc(doc(db, 'users', user.uid));
            if (mySnap.exists()) {
                const data = mySnap.data();
                setBio(data.bio || '');
                setBioInput(data.bio || '');
                setBannerId(data.bannerId || 'orange');
                setFollowing(data.following || []);
            }

            // 2. All users
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersData = usersSnap.docs
                .map(d => ({ uid: d.id, ...d.data() }))
                .filter(u => u.uid !== user.uid);       // exclude self
            setAllUsers(usersData);
            setLoadingUsers(false);
        };
        fetchData();
    }, [user?.uid]);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleSaveBio = async () => {
        setSavingBio(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), { bio: bioInput });
            setBio(bioInput);
            setEditingBio(false);
        } catch (e) { console.error(e); }
        finally { setSavingBio(false); }
    };

    const handleSelectBanner = async (id) => {
        setBannerId(id);
        setShowBannerPicker(false);
        setSavingBanner(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), { bannerId: id });
        } catch (e) { console.error(e); }
        finally { setSavingBanner(false); }
    };

    const handleFollow = async (targetUid) => {
        const myRef = doc(db, 'users', user.uid);
        const targetRef = doc(db, 'users', targetUid);
        const isFollowing = following.includes(targetUid);
        try {
            if (isFollowing) {
                // Unfollow
                await updateDoc(myRef, { following: arrayRemove(targetUid) });
                await updateDoc(targetRef, { followers: arrayRemove(user.uid) });
                setFollowing(prev => prev.filter(uid => uid !== targetUid));
            } else {
                // Follow
                await updateDoc(myRef, { following: arrayUnion(targetUid) });
                await updateDoc(targetRef, { followers: arrayUnion(user.uid) });
                setFollowing(prev => [...prev, targetUid]);
            }
        } catch (e) { console.error('Follow error:', e); }
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Banner ────────────────────────────────────────────────── */}
            <div className={`relative h-52 overflow-hidden transition-all duration-500 ${getBannerClass(bannerId)}`}>
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-white/10" />

                {/* Back */}
                <button onClick={onBack}
                    className="absolute top-5 left-5 flex items-center space-x-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
                    <span>←</span><span>Back</span>
                </button>

                {/* Edit banner button */}
                <button
                    onClick={() => setShowBannerPicker(p => !p)}
                    className="absolute top-5 right-5 flex items-center gap-1.5 bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                >
                    🎨 {showBannerPicker ? 'Close' : 'Edit Cover'}
                    {savingBanner && <span className="ml-1 opacity-70 animate-pulse">Saving…</span>}
                </button>

                {/* Banner picker panel */}
                {showBannerPicker && (
                    <div className="absolute bottom-4 right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-3 flex gap-2 flex-wrap max-w-xs border border-white/50 z-10">
                        {BANNER_THEMES.map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => handleSelectBanner(theme.id)}
                                title={theme.label}
                                className={`w-10 h-10 rounded-xl ${theme.className} transition-transform hover:scale-110 ${bannerId === theme.id ? 'ring-3 ring-white ring-offset-2 scale-110' : ''}`}
                            />
                        ))}
                        <p className="w-full text-center text-[10px] text-gray-400 mt-1 font-medium">Choose a cover theme</p>
                    </div>
                )}
            </div>

            {/* ── Profile content ────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4">

                {/* Avatar + stats row */}
                <div className="relative -mt-16 mb-4 flex items-end justify-between">
                    <div className="relative">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&size=128&background=f97316&color=fff`}
                            alt={user.name}
                            className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl object-cover"
                        />
                        <span className="absolute -bottom-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                            Active
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 mb-2">
                        {[
                            { label: 'Trips Created', value: myCreatedTrips.length },
                            { label: 'Trips Joined', value: myJoinedTrips.length },
                            { label: 'Following', value: following.length },
                        ].map(stat => (
                            <div key={stat.label} className="text-center bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                                <p className="text-xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Name + bio */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
                    <p className="text-gray-400 text-sm">{user.email}</p>

                    {editingBio ? (
                        <div className="mt-3 flex items-start gap-2">
                            <textarea
                                className="flex-1 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                rows={2} value={bioInput} onChange={e => setBioInput(e.target.value)}
                                placeholder="Write something about yourself…" maxLength={160} />
                            <div className="flex flex-col gap-2">
                                <button onClick={handleSaveBio} disabled={savingBio}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors disabled:opacity-60">
                                    {savingBio ? 'Saving…' : 'Save'}
                                </button>
                                <button onClick={() => { setEditingBio(false); setBioInput(bio); }}
                                    className="text-gray-400 hover:text-gray-600 text-xs font-bold px-4 py-2 rounded-full border border-gray-200 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 flex items-center gap-3">
                            <p className="text-gray-600 text-sm">
                                {bio || <span className="italic text-gray-300">No bio yet. Tell people about yourself!</span>}
                            </p>
                            <button onClick={() => setEditingBio(true)}
                                className="shrink-0 text-xs text-orange-500 hover:text-orange-600 font-bold border border-orange-200 px-3 py-1 rounded-full transition-colors">
                                ✏️ Edit
                            </button>
                        </div>
                    )}

                    {/* Mobile stats */}
                    <div className="sm:hidden flex items-center gap-3 mt-4">
                        {[
                            { label: 'Created', value: myCreatedTrips.length },
                            { label: 'Joined', value: myJoinedTrips.length },
                            { label: 'Following', value: following.length },
                        ].map(stat => (
                            <div key={stat.label} className="text-center bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 flex-1">
                                <p className="text-xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Tabs ──────────────────────────────────────────────────── */}
                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-bold whitespace-nowrap shrink-0 border-b-2 transition-colors ${activeTab === tab ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400 hover:text-gray-700'}`}>
                            {tab}
                            {tab === 'Following' && following.length > 0 && (
                                <span className="ml-1.5 bg-orange-100 text-orange-600 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {following.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab bodies ────────────────────────────────────────────── */}
                <div className="pb-20">

                    {/* OVERVIEW */}
                    {activeTab === 'Overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { emoji: '✈️', label: 'Trips Created', value: myCreatedTrips.length },
                                    { emoji: '🤝', label: 'Trips Joined', value: myJoinedTrips.length },
                                    { emoji: '👥', label: 'Following', value: following.length },
                                ].map(card => (
                                    <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                                        <span className="text-3xl">{card.emoji}</span>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900">{card.value}</p>
                                            <p className="text-xs text-gray-400 font-medium">{card.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h2 className="font-black text-gray-900 mb-4">Recent Plans</h2>
                                {[...myCreatedTrips, ...myJoinedTrips].length === 0 ? (
                                    <EmptyState emoji="🗺️" title="No trips yet!" subtitle="Create or join a trip to see your activity here." actionLabel="Plan a Trip" onAction={onPlanTrip} />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[...myCreatedTrips, ...myJoinedTrips].slice(0, 4).map(trip => (
                                            <TripCard key={trip.id} trip={trip} user={user} onJoin={onJoin} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* INTERESTED PLANS */}
                    {activeTab === 'Interested Plans' && (
                        <div>
                            <p className="text-gray-400 text-sm mb-6">Trips you've joined from the community.</p>
                            {myJoinedTrips.length === 0 ? (
                                <EmptyState emoji="🔖" title="No interested plans yet" subtitle="Browse community trips and hit Join to save them here." actionLabel="Browse Trips" onAction={onBack} />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {myJoinedTrips.map(trip => <TripCard key={trip.id} trip={trip} user={user} onJoin={onJoin} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MY TRIPS */}
                    {activeTab === 'My Trips' && (
                        <div>
                            <p className="text-gray-400 text-sm mb-6">Itineraries you have created.</p>
                            {myCreatedTrips.length === 0 ? (
                                <EmptyState emoji="✈️" title="No trips created yet" subtitle="Start planning your first adventure with TripCircle!" actionLabel="Plan Your First Trip" onAction={onPlanTrip} />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                                    {myCreatedTrips.map(trip => <TripCard key={trip.id} trip={trip} user={user} onJoin={onJoin} showLeave={false} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FOLLOWING */}
                    {activeTab === 'Following' && (
                        <div className="space-y-8">

                            {/* People I follow */}
                            <div>
                                <h2 className="font-black text-gray-900 mb-1">
                                    Following
                                    <span className="ml-2 text-orange-500">{followingUsers.length}</span>
                                </h2>
                                <p className="text-gray-400 text-sm mb-4">People you're connected with on TripCircle.</p>

                                {loadingUsers ? (
                                    <div className="text-center py-10 text-gray-400 animate-pulse">Loading…</div>
                                ) : followingUsers.length === 0 ? (
                                    <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm">You aren't following anyone yet. Discover travellers below!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {followingUsers.map(fu => (
                                            <div key={fu.uid} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <img
                                                    src={fu.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fu.name || 'User')}&background=f97316&color=fff&size=80`}
                                                    alt={fu.name}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{fu.name || 'TripCircle User'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{fu.email || ''}</p>
                                                    {fu.bio && <p className="text-xs text-gray-500 mt-0.5 truncate italic">"{fu.bio}"</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleFollow(fu.uid)}
                                                    className="shrink-0 text-xs text-red-500 font-bold border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                                                >
                                                    Unfollow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Discover more travellers */}
                            <div>
                                <h2 className="font-black text-gray-900 mb-1">
                                    Discover Travellers
                                    <span className="ml-2 text-gray-400 font-normal text-sm">{discoverUsers.length} people</span>
                                </h2>
                                <p className="text-gray-400 text-sm mb-4">Other TripCircle members you can connect with.</p>

                                {loadingUsers ? (
                                    <div className="text-center py-10 text-gray-400 animate-pulse">Loading members…</div>
                                ) : discoverUsers.length === 0 ? (
                                    <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm">You're following everyone! 🎉</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {discoverUsers.map(du => (
                                            <div key={du.uid} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                <img
                                                    src={du.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(du.name || 'User')}&background=6366f1&color=fff&size=80`}
                                                    alt={du.name}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 text-sm truncate">{du.name || 'TripCircle User'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{du.email || ''}</p>
                                                    {du.bio && <p className="text-xs text-gray-500 mt-0.5 truncate italic">"{du.bio}"</p>}
                                                </div>
                                                <button
                                                    onClick={() => handleFollow(du.uid)}
                                                    className="shrink-0 text-xs text-white font-bold bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full transition-colors"
                                                >
                                                    Follow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
