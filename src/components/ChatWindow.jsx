import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendMessage } from '../services/chatService';

const ChatWindow = ({ chat, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!chat?.id) return;

    // Query messages subcollection ordered by creation time, limit 50
    const q = query(
      collection(db, "chats", chat.id, "messages"),
      orderBy("createdAt", "desc"), // fetch descending to get latest 50, then reverse
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Reverse to display ascending (oldest at top, newest at bottom)
      setMessages(msgs.reverse());
    });

    return () => unsubscribe();
  }, [chat?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await sendMessage(chat.id, currentUser, input);
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please check your connection or permissions.");
    }
  };

  if (!chat) return null;

  // Determine chat name for header
  let chatTitle = "Chat";
  if (chat.type === "direct") {
    // Find the other participant's name
    const otherId = chat.participantIds.find(id => id !== currentUser.uid);
    if (otherId && chat.participantsData && chat.participantsData[otherId]) {
      chatTitle = chat.participantsData[otherId].name;
    }
  } else if (chat.type === "group") {
    chatTitle = chat.tripName || "Trip Group Chat";
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-black text-gray-900">{chatTitle}</h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-full uppercase tracking-wider">
          {chat.type}
        </span>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-4xl mb-2">👋</span>
            <p className="text-sm font-medium">Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.uid;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[75%] p-3 text-sm ${
                  isMe 
                    ? "bg-orange-500 text-white self-end ml-auto rounded-2xl rounded-tr-sm shadow-sm" 
                    : "bg-gray-100 text-gray-800 self-start mr-auto rounded-2xl rounded-tl-sm"
                }`}
              >
                {!isMe && chat.type === 'group' && (
                  <span className="text-[10px] font-black block mb-1 text-orange-500 opacity-80">{msg.senderName}</span>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
