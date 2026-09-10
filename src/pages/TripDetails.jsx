import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripMembers } from '../hooks/useTripMembers';
import { useTripInvitations } from '../hooks/useTripInvitations';
import { useUsers } from '../hooks/useUsers';
import { cancelInvitation } from '../services/invitationService';
import FindHotelsButton from '../components/FindHotelsButton';

const TripDetails = ({ trips = [], user, onJoin, onMessageGroup }) => {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const trip = trips.find(t => t.id === tripId);
  
  const { members: tripMembers, loading: loadingMembers } = useTripMembers(tripId);
  const isCreator = user && trip?.creatorId === user.uid;
  
  // Only fetch invitations if creator
  const { invitations, loading: loadingInvites } = useTripInvitations(isCreator ? tripId : null);

  // Extract all unique user IDs we need to fetch profiles for
  const userIdsToFetch = useMemo(() => {
    const ids = new Set();
    tripMembers.forEach(m => ids.add(m.userId));
    if (isCreator) {
      invitations.forEach(i => ids.add(i.receiverId));
    }
    return Array.from(ids);
  }, [tripMembers, invitations, isCreator]);

  const { users: userProfiles, loading: loadingUsers } = useUsers(userIdsToFetch);

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

  const isJoined = user && tripMembers.some(m => m.userId === user.uid);
  
  const handleCancelInvite = async (invitationId) => {
    if (window.confirm("Are you sure you want to cancel this invitation?")) {
      await cancelInvitation(invitationId);
    }
  };

  const renderUserList = (userIds, emptyMessage) => {
    if (userIds.length === 0) return <p className="text-gray-500 italic text-sm">{emptyMessage}</p>;
    return (
      <div className="space-y-3">
        {userIds.map(uid => {
          const profile = userProfiles[uid];
          if (!profile) return null;
          return (
            <div key={uid} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => navigate(`/profile/${uid}`)}>
              <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}`} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-gray-900 text-sm">{profile.name}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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
            <img src={trip.coverImage?.imageUrl || trip.img} alt={trip.location || trip.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {trip.coverImage && trip.coverImage.photographerName && (
              <div className="absolute top-4 right-4 z-10 text-xs text-white/80 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
                Photo by <a href={trip.coverImage.photographerProfile} target="_blank" rel="noopener noreferrer" className="hover:text-white underline font-medium">{trip.coverImage.photographerName}</a> on <a href={trip.coverImage.unsplashHome} target="_blank" rel="noopener noreferrer" className="hover:text-white underline font-medium">Unsplash</a>
              </div>
            )}

            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-2">{trip.location}</h1>
              <div className="flex gap-2 flex-wrap mb-2">
                <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                  {trip.visibility === 'public' ? '🌍 Public' : trip.visibility === 'followers' ? '👥 Followers Only' : '✉️ Invite Only'}
                </span>
                {trip.tags.map((tag, i) => (
                  <span key={i} className="bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold border border-white/30">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
              <div>
                <p className="text-3xl font-black text-orange-600">₹{trip.budget.toLocaleString()}</p>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Est. Budget / Person</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <FindHotelsButton destination={trip.location} />
                
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Trip Details</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {trip.notes || "No details provided for this trip yet."}
                  </p>
                </div>
              </div>
              
              <div className="md:col-span-1 space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 flex items-center justify-between">
                    Members
                    <span className="bg-gray-100 text-gray-600 text-sm py-0.5 px-2 rounded-full">{tripMembers.length}</span>
                  </h3>
                  {loadingMembers || loadingUsers ? (
                    <div className="text-sm text-gray-400 animate-pulse">Loading members...</div>
                  ) : (
                    renderUserList(tripMembers.map(m => m.userId), "No one has joined yet.")
                  )}
                </div>

                {isCreator && trip.visibility === 'invite' && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Invitations Dashboard</h3>
                    
                    {loadingInvites ? (
                      <div className="text-sm text-gray-400 animate-pulse">Loading invitations...</div>
                    ) : (
                      <div className="space-y-6">
                        {['pending', 'accepted', 'declined', 'cancelled', 'expired'].map(status => {
                          const usersInStatus = invitations.filter(i => i.status === status).map(i => i.receiverId);
                          if (usersInStatus.length === 0) return null;
                          return (
                            <div key={status}>
                              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 flex justify-between">
                                {status}
                                <span>{usersInStatus.length}</span>
                              </h4>
                              <div className="space-y-2">
                                {usersInStatus.map(uid => {
                                  const profile = userProfiles[uid];
                                  if (!profile) return null;
                                  const inv = invitations.find(i => i.receiverId === uid);
                                  return (
                                    <div key={uid} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <img src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}`} alt={profile.name} className="w-8 h-8 rounded-full" />
                                        <p className="text-xs font-bold text-gray-900 truncate max-w-[80px]">{profile.name}</p>
                                      </div>
                                      {status === 'pending' && (
                                        <button onClick={() => handleCancelInvite(inv.id)} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-100">Cancel</button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                        {invitations.length === 0 && <p className="text-xs text-gray-500 italic">No invitations sent.</p>}
                      </div>
                    )}
                  </div>
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
