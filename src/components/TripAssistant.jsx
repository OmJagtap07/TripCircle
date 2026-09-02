import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── 1. Define the Tool for Function Calling ──
const weatherTool = {
  functionDeclarations: [
    {
      name: "checkLiveWeather",
      description: "Get the current weather forecast for a given travel destination.",
      parameters: {
        type: "OBJECT",
        properties: {
          location: {
            type: "STRING",
            description: "The city or destination name, e.g. Paris, Tokyo",
          },
        },
        required: ["location"],
      },
    },
  ],
};

const TripAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your TripCircle Guide. 🌍 Ask me about hot spots in Goa, hidden gems in Manali, or budget tips!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // ── 2. Add Token Monitoring State ──
  const [totalTokens, setTotalTokens] = useState(0);
  
  const messagesEndRef = useRef(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add User Message
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 3. Configure Model with Tools
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        tools: [weatherTool] 
      });
      
      // We use startChat instead of generateContent to support multi-turn function calling
      const chat = model.startChat();
      
      const prompt = `
        You are the TripCircle AI Assistant. Your goal is to help users plan trips.
        - Suggest "hot spots" and trending locations.
        - Keep answers short, fun, and emoji-friendly.
        - If asked about budget, give estimates in INR (₹).
        - If the user asks about the weather, ALWAYS use the checkLiveWeather tool.
        - You MUST return ONLY a valid JSON object in the final response. Do not include markdown formatting or backticks.
        - The JSON must follow this exact structure:
        {
          "destination": "...",
          "days": 3,
          "estimatedBudget": "₹15,000",
          "weather": "...",
          "itinerary": [
            {
              "day": 1,
              "activities": ["..."]
            }
          ]
        }
        - User asked: ${input}
      `;

      // Initial request
      let result = await chat.sendMessage(prompt);
      let response = await result.response;

      // Update Token Counter
      if (response.usageMetadata) {
        setTotalTokens(prev => prev + response.usageMetadata.totalTokenCount);
      }

      // 4. Handle Function Calling (Intercepting the tool use)
      if (response.functionCalls()) {
        const call = response.functionCalls()[0];
        
        if (call.name === 'checkLiveWeather') {
           const { location } = call.args;
           console.log(`[TripCircle AI Tool Called] Fetching weather for: ${location}`);
           
           // Simulated local function execution
           const simulatedWeather = `Sunny, 28°C (Simulated data for ${location})`;
           
           // Send the function result back to Gemini so it can answer the user
           result = await chat.sendMessage([{
             functionResponse: {
               name: 'checkLiveWeather',
               response: { weather: simulatedWeather }
             }
           }]);
           response = await result.response;
           
           // Update tokens again after second turn
           if (response.usageMetadata) {
             setTotalTokens(prev => prev + response.usageMetadata.totalTokenCount);
           }
        }
      }

      const aiText = response.text();

      // Add AI Message
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Oops! I'm having trouble connecting to the travel satellite. 🛰️ Try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING CHAT BUTTON (With Expand-on-Hover Effect) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-8 z-40 bg-gray-900 text-white p-4 rounded-full shadow-2xl transition-all duration-300 border border-gray-700 flex items-center gap-0 hover:gap-3 hover:pr-6 group"
        >
          {/* Icon */}
          <div className="relative">
             <div className="absolute inset-0 bg-orange-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
             </svg>
          </div>

          {/* Text Reveal Animation */}
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold text-gray-100">
            Ask AI Guide
          </span>
        </button>
      )}

      {/* CHAT WINDOW (Visible when open) */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-8 z-50 w-[90%] sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 animate-in slide-in-from-bottom-10 duration-300">
          
          {/* 5. Header (Updated with Token Monitoring UI) */}
          <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h3 className="font-bold">TripCircle AI</h3>
            </div>
            <div className="flex items-center gap-4">
              {/* Token Counter */}
              <div className="text-[10px] text-orange-400 font-mono bg-gray-800 px-2 py-1 rounded border border-gray-700" title="Total Gemini tokens consumed">
                Tokens: {totalTokens.toLocaleString()}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <div className="space-y-2">
                      {(() => {
                        try {
                          const data = JSON.parse(msg.text);
                          return (
                            <>
                              {data.destination && <p><strong>Destination:</strong> {data.destination}</p>}
                              {data.days && <p><strong>Days:</strong> {data.days}</p>}
                              {data.estimatedBudget && <p><strong>Budget:</strong> {data.estimatedBudget}</p>}
                              {data.weather && <p><strong>Weather 🌤️:</strong> {data.weather}</p>}
                              {data.itinerary && data.itinerary.map((item, idx) => (
                                <div key={idx} className="mt-2">
                                  <strong>Day {item.day}:</strong>
                                  <ul className="list-disc pl-4 mt-1">
                                    {item.activities && item.activities.map((act, i) => <li key={i}>{act}</li>)}
                                  </ul>
                                </div>
                              ))}
                            </>
                          );
                        } catch (e) {
                          return msg.text.split('*').join('');
                        }
                      })()}
                    </div>
                  ) : (
                    msg.text.split('*').join('')
                  )} 
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hotspots or weather..."
                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
};

export default TripAssistant;