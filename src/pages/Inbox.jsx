import React, { useState, useEffect } from 'react';
import { subscribeToUserChats } from '../services/chatService';
import ChatWindow from '../components/ChatWindow';

const Inbox = ({ user, initialChatId }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserChats(user.uid, (fetchedChats) => {
      setChats(fetchedChats);
      setLoading(false);
      
      // If we passed an initialChatId and haven't selected a chat yet, select it.
      if (initialChatId && !selectedChat) {
        const targetChat = fetchedChats.find(c => c.id === initialChatId);
        if (targetChat) setSelectedChat(targetChat);
      }
    });

    return () => unsubscribe();
  }, [user?.uid, initialChatId, selectedChat]);

  const renderChatPreview = (chat) => {
    let title = "Chat";
    let avatarUrl = `https://ui-avatars.com/api/?name=Chat&background=f97316&color=fff`;

    if (chat.type === "direct") {
      const otherId = chat.participantIds.find(id => id !== user.uid);
      if (otherId && chat.participantsData?.[otherId]) {
        title = chat.participantsData[otherId].name;
        avatarUrl = chat.participantsData[otherId].avatar || `https://ui-avatars.com/api/?name=${title}&background=f97316&color=fff`;
      }
    } else if (chat.type === "group") {
      title = chat.tripName || "Trip Group Chat";
      avatarUrl = `https://ui-avatars.com/api/?name=${title}&background=4f46e5&color=fff`;
    }

    const isActive = selectedChat?.id === chat.id;
    const lastMsgText = chat.lastMessage?.text || "No messages yet";
    const lastMsgTime = chat.lastMessage?.createdAt 
      ? new Date(chat.lastMessage.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      : "";

    return (
      <button
        key={chat.id}
        onClick={() => setSelectedChat(chat)}
        className={`w-full text-left flex items-center gap-3 p-4 border-b border-gray-100 transition-colors ${
          isActive ? 'bg-orange-50 border-l-4 border-l-orange-500' : 'hover:bg-gray-50'
        }`}
      >
        <img src={avatarUrl} alt={title} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className={`font-bold text-sm truncate ${isActive ? 'text-orange-700' : 'text-gray-900'}`}>{title}</h4>
            <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-2">{lastMsgTime}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{lastMsgText}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 h-[calc(100vh-80px)]">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex h-full">
        
        {/* Left Sidebar: Chat List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-2xl font-black text-gray-900">Inbox</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400 animate-pulse">Loading messages...</div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm font-medium">No active conversations yet.</p>
                <p className="text-gray-400 text-xs mt-1">Start a chat from someone's profile!</p>
              </div>
            ) : (
              chats.map(renderChatPreview)
            )}
          </div>
        </div>

        {/* Right Area: Active Chat Window */}
        <div className={`flex-1 bg-gray-50/30 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <div className="flex-1 p-4 h-full">
              <div className="md:hidden mb-2">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  ← Back to Inbox
                </button>
              </div>
              <ChatWindow chat={selectedChat} currentUser={user} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-4 opacity-50">💬</div>
              <h3 className="text-xl font-bold text-gray-800">Your Messages</h3>
              <p className="text-gray-500 text-sm max-w-sm mt-2">Select a conversation from the sidebar to view your messages or start a new chat with fellow travelers.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inbox;
