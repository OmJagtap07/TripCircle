import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import {
    doc, getDoc, updateDoc, collection, getDocs,
    arrayUnion, arrayRemove
} from 'firebase/firestore';
import { getOrCreateDirectChat } from '../services/chatService';

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
        {onAction && actionLabel && (
            <button onClick={onAction} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors">
                {actionLabel}
            </button>
        )}
    </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const TABS = ['Overview', 'Interested Plans', 'My Trips', 'Following'];

const UserProfile = ({ currentUser, trips, onPlanTrip, onJoin }) => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const onBack = () => navigate(-1);

    const isOwnProfile = currentUser?.uid === uid;

    const [profileUser, setProfileUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
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
    const [allUsers, setAllUsers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    // ── Fetch Profile User ───────────────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            setLoadingProfile(true);
            try {
                const snap = await getDoc(doc(db, 'users', uid));
                if (snap.exists()) {
                    setProfileUser({ uid: snap.id, ...snap.data() });
                    setBio(snap.data().bio || '');
                    setBioInput(snap.data().bio || '');
                    setBannerId(snap.data().bannerId || 'orange');
                    setFollowing(snap.data().following || []);
                } else {
                    setProfileUser(null);
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
            } finally {
                setLoadingProfile(false);
            }
        };
        if (uid) fetchProfile();
    }, [uid]);

    // ── Fetch All Users ──────────────────────────────────────────────
    useEffect(() => {
        const fetchAllUsers = async () => {
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersData = usersSnap.docs
                .map(d => ({ uid: d.id, ...d.data() }))
                .filter(u => u.uid !== uid); // exclude the profile user
            setAllUsers(usersData);
            setLoadingUsers(false);
        };
        fetchAllUsers();
    }, [uid]);

    // ── Handlers ─────────────────────────────────────────────────────
    const onMessageUser = async (targetUser) => {
        if (!currentUser) {
            alert("Please login to message users!");
            return;
        }
        const chatId = await getOrCreateDirectChat(currentUser, targetUser);
        navigate(`/inbox/${chatId}`);
    };

    const handleSaveBio = async () => {
        setSavingBio(true);
        try {
            await updateDoc(doc(db, 'users', uid), { bio: bioInput });
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
            await updateDoc(doc(db, 'users', uid), { bannerId: id });
        } catch (e) { console.error(e); }
        finally { setSavingBanner(false); }
    };

    const handleFollow = async (targetUid) => {
        if (!currentUser) return alert("Please login to follow users!");
        
        const myRef = doc(db, 'users', currentUser.uid);
        const targetRef = doc(db, 'users', targetUid);
        
        const myDoc = await getDoc(myRef);
        const myFollowing = myDoc.data()?.following || [];
        const isFollowing = myFollowing.includes(targetUid);

        try {
            if (isFollowing) {
                await updateDoc(myRef, { following: arrayRemove(targetUid) });
                await updateDoc(targetRef, { followers: arrayRemove(currentUser.uid) });
                if (isOwnProfile) setFollowing(prev => prev.filter(id => id !== targetUid));
            } else {
                await updateDoc(myRef, { following: arrayUnion(targetUid) });
                await updateDoc(targetRef, { followers: arrayUnion(currentUser.uid) });
                if (isOwnProfile) setFollowing(prev => [...prev, targetUid]);
            }
        } catch (e) { console.error('Follow error:', e); }
    };

    if (loadingProfile) {
        return (
            <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center">
                <div className="text-orange-500 font-bold animate-pulse text-lg">Loading Profile...</div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center">
                <h2 className="text-3xl font-black text-gray-800 mb-4">User not found</h2>
                <button onClick={onBack} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all">Go Back</button>
            </div>
        );
    }

    const user = profileUser;

    // ── Derived data ─────────────────────────────────────────────────
    const myCreatedTrips = trips.filter(t => t.creatorId === user.uid);
    const myJoinedTrips = trips.filter(t => t.members?.includes(user.uid) && t.creatorId !== user.uid);

    const followingUsers = allUsers.filter(u => following.includes(u.uid));
    const discoverUsers = allUsers.filter(u => u.uid !== user.uid && !following.includes(u.uid));

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* ── Banner ────────────────────────────────────────────────── */}
            <div className={`relative h-64 overflow-hidden transition-all duration-500 ${getBannerClass(bannerId)}`}>
                <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-white/10" />

                <button onClick={onBack}
                    className="absolute top-5 left-5 flex items-center space-x-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
                    <span>←</span><span>Back</span>
                </button>

                {isOwnProfile && (
                    <button
                        onClick={() => setShowBannerPicker(p => !p)}
                        className="absolute top-5 right-5 flex items-center gap-1.5 bg-black/25 hover:bg-black/40 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors"
                    >
                        🎨 {showBannerPicker ? 'Close' : 'Edit Cover'}
                        {savingBanner && <span className="ml-1 opacity-70 animate-pulse">Saving…</span>}
                    </button>
                )}

                {showBannerPicker && isOwnProfile && (
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

                <div className="relative -mt-20 mb-4 flex items-end justify-between">
                    <div className="relative">
                        <img
                            src={user.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}&backgroundColor=0284c7,059669,dc2626,ea580c,7c3aed,db2777&textColor=ffffff`}
                            alt={user.name}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
                        />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-sm" title="Active"></div>
                    </div>
                    {!isOwnProfile && currentUser && (
                        <button 
                            onClick={() => onMessageUser(user)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all flex items-center gap-2 mb-2 hover:scale-105"
                        >
                            💬 Message
                        </button>
                    )}
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900">{user.name}</h1>
                    <p className="text-gray-500 font-medium mt-1">{user.email} &bull; Traveler</p>

                    {editingBio && isOwnProfile ? (
                        <div className="mt-4 flex items-start gap-3">
                            <textarea
                                className="flex-1 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none shadow-inner"
                                rows={3} value={bioInput} onChange={e => setBioInput(e.target.value)}
                                placeholder="Write something about yourself…" maxLength={160} />
                            <div className="flex flex-col gap-2 shrink-0">
                                <button onClick={handleSaveBio} disabled={savingBio}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-60 shadow-md">
                                    {savingBio ? 'Saving…' : 'Save'}
                                </button>
                                <button onClick={() => { setEditingBio(false); setBioInput(bio); }}
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-bold px-5 py-2 rounded-xl border border-gray-200 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
                            <p className="text-gray-700 flex-1">
                                {bio || <span className="italic text-gray-400">No bio yet. {isOwnProfile ? "Tell people about yourself!" : ""}</span>}
                            </p>
                            {isOwnProfile && (
                                <button onClick={() => setEditingBio(true)}
                                    className="shrink-0 text-sm text-orange-500 hover:text-orange-600 font-bold border border-orange-200 px-4 py-1.5 rounded-full transition-colors hover:bg-orange-50">
                                    ✏️ Edit
                                </button>
                            )}
                        </div>
                    )}

                    <div className="sm:hidden flex items-center gap-3 mt-6">
                        {[
                            { label: 'Created', value: myCreatedTrips.length },
                            { label: 'Joined', value: myJoinedTrips.length },
                            { label: 'Following', value: following.length },
                        ].map(stat => (
                            <div key={stat.label} className="text-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex-1">
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
                    {TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-4 text-sm font-bold whitespace-nowrap shrink-0 border-b-2 transition-colors ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}>
                            {tab}
                            {tab === 'Following' && following.length > 0 && (
                                <span className={`ml-2 text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {following.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="pb-10">

                    {activeTab === 'Overview' && (
                        <div className="space-y-8">
                            <div className="hidden sm:grid grid-cols-3 gap-6">
                                {[
                                    { emoji: '✈️', label: 'Trips Created', value: myCreatedTrips.length },
                                    { emoji: '🤝', label: 'Trips Joined', value: myJoinedTrips.length },
                                    { emoji: '👥', label: 'Following', value: following.length },
                                ].map(card => (
                                    <div key={card.label} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className="text-4xl bg-orange-50 w-16 h-16 flex items-center justify-center rounded-2xl">{card.emoji}</div>
                                        <div>
                                            <p className="text-3xl font-black text-gray-900">{card.value}</p>
                                            <p className="text-sm text-gray-400 font-bold tracking-wide uppercase">{card.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h2 className="text-xl font-black text-gray-900 mb-6">Recent Plans</h2>
                                {[...myCreatedTrips, ...myJoinedTrips].length === 0 ? (
                                    <EmptyState emoji="🗺️" title="No trips yet!" subtitle="Activity will appear here." actionLabel={isOwnProfile ? "Plan a Trip" : null} onAction={isOwnProfile ? onPlanTrip : null} />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {[...myCreatedTrips, ...myJoinedTrips].slice(0, 3).map(trip => (
                                            <TripCard key={trip.id} trip={trip} user={currentUser} onJoin={onJoin} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Interested Plans' && (
                        <div>
                            <p className="text-gray-500 text-sm mb-6 font-medium">Trips joined from the community.</p>
                            {myJoinedTrips.length === 0 ? (
                                <EmptyState emoji="🔖" title="No interested plans yet" subtitle="" actionLabel={isOwnProfile ? "Browse Trips" : null} onAction={isOwnProfile ? onBack : null} />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {myJoinedTrips.map(trip => <TripCard key={trip.id} trip={trip} user={currentUser} onJoin={onJoin} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'My Trips' && (
                        <div>
                            <p className="text-gray-500 text-sm mb-6 font-medium">Itineraries created.</p>
                            {myCreatedTrips.length === 0 ? (
                                <EmptyState emoji="✈️" title="No trips created yet" subtitle="" actionLabel={isOwnProfile ? "Plan Your First Trip" : null} onAction={isOwnProfile ? onPlanTrip : null} />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {myCreatedTrips.map(trip => <TripCard key={trip.id} trip={trip} user={currentUser} onJoin={onJoin} showLeave={false} />)}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Following' && (
                        <div className="space-y-12">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black text-gray-900">Following</h2>
                                    <span className="bg-orange-100 text-orange-600 text-xs font-black px-3 py-1 rounded-full">{followingUsers.length}</span>
                                </div>
                                <p className="text-gray-500 text-sm mb-6 font-medium">People {isOwnProfile ? "you're" : "they're"} connected with.</p>

                                {loadingUsers ? (
                                    <div className="text-center py-10 text-gray-400 font-bold animate-pulse">Loading…</div>
                                ) : followingUsers.length === 0 ? (
                                    <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 font-medium">Not following anyone yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {followingUsers.map(fu => (
                                            <div key={fu.uid} onClick={() => navigate(`/profile/${fu.uid}`)} className="cursor-pointer flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                                <img
                                                    src={fu.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${fu.name || 'User'}&backgroundColor=0284c7,059669,dc2626,ea580c,7c3aed,db2777&textColor=ffffff`}
                                                    alt={fu.name}
                                                    className="w-14 h-14 rounded-full object-cover ring-4 ring-orange-50"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-gray-900 text-sm truncate">{fu.name || 'TripCircle User'}</p>
                                                    <p className="text-xs text-gray-500 font-medium truncate">{fu.email || ''}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {isOwnProfile && (
                                <div className="pt-8 border-t border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl font-black text-gray-900">Discover Travellers</h2>
                                        <span className="bg-indigo-100 text-indigo-600 text-xs font-black px-3 py-1 rounded-full">{discoverUsers.length}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-6 font-medium">Other TripCircle members you can connect with.</p>

                                    {loadingUsers ? (
                                        <div className="text-center py-10 text-gray-400 font-bold animate-pulse">Loading members…</div>
                                    ) : discoverUsers.length === 0 ? (
                                        <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <p className="text-gray-500 font-medium">You're following everyone! 🎉</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {discoverUsers.map(du => (
                                                <div key={du.uid} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                                    <img
                                                        src={du.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${du.name || 'User'}&backgroundColor=0284c7,059669,dc2626,ea580c,7c3aed,db2777&textColor=ffffff`}
                                                        alt={du.name}
                                                        className="w-14 h-14 rounded-full object-cover ring-4 ring-indigo-50 cursor-pointer"
                                                        onClick={() => navigate(`/profile/${du.uid}`)}
                                                    />
                                                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/profile/${du.uid}`)}>
                                                        <p className="font-black text-gray-900 text-sm truncate">{du.name || 'TripCircle User'}</p>
                                                        <p className="text-xs text-gray-500 font-medium truncate">{du.email || ''}</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleFollow(du.uid); }}
                                                        className="shrink-0 text-xs text-white font-bold bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors shadow-sm"
                                                    >
                                                        Follow
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default UserProfile;
