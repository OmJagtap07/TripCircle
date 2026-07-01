import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { acceptInvitation, declineInvitation } from '../services/invitationService';

const Notifications = ({ user }) => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications(user);

  const handleAccept = async (notification) => {
    try {
      await acceptInvitation(notification.invitationId, notification.tripId, user.uid, user);
      await markAsRead(notification.id);
      alert('Invitation accepted!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation.');
    }
  };

  const handleDecline = async (notification) => {
    try {
      await declineInvitation(notification.invitationId);
      await markAsRead(notification.id);
      alert('Invitation declined.');
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert('Failed to decline invitation.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 font-bold animate-pulse text-xl">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-gray-900">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-full transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-xl font-bold text-gray-900 mb-2">No notifications yet</p>
            <p className="text-gray-500">When you get invited to a trip, it will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notif => {
              const isUnread = !notif.read;
              const { tripData } = notif;
              
              return (
                <div 
                  key={notif.id} 
                  className={`bg-white rounded-2xl border ${isUnread ? 'border-orange-200 shadow-md ring-1 ring-orange-50' : 'border-gray-100 shadow-sm opacity-75 hover:opacity-100'} p-5 transition-all flex flex-col sm:flex-row gap-5 relative overflow-hidden`}
                >
                  {isUnread && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  )}
                  
                  {/* Trip Cover Thumbnail */}
                  {tripData?.img && (
                    <div className="shrink-0">
                      <img 
                        src={tripData.img} 
                        alt="Trip Cover" 
                        className="w-full sm:w-32 h-32 sm:h-full object-cover rounded-xl"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-lg ${isUnread ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                        {notif.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {notif.message}
                    </p>

                    {tripData && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                          📍 {tripData.location}
                        </span>
                        {tripData.dateRange && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-semibold flex items-center gap-1">
                            📅 {tripData.dateRange}
                          </span>
                        )}
                      </div>
                    )}

                    {notif.type === 'trip_invitation' && isUnread ? (
                      <div className="flex flex-wrap gap-3">
                        <button 
                          onClick={() => handleAccept(notif)}
                          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2 rounded-xl transition-transform active:scale-95 shadow-sm"
                        >
                          Accept Invite
                        </button>
                        <button 
                          onClick={() => handleDecline(notif)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-6 py-2 rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                        <button 
                          onClick={() => navigate(`/trip/${notif.tripId}`)}
                          className="text-indigo-600 hover:bg-indigo-50 text-sm font-bold px-6 py-2 rounded-xl transition-colors"
                        >
                          View Trip Info
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => navigate(`/trip/${notif.tripId}`)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold px-6 py-2 rounded-xl transition-colors"
                        >
                          View Trip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
