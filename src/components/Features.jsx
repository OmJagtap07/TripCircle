import React from 'react';

const Features = () => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-gray-900">Not Just Another Booking Site.</h2>
        <p className="text-gray-500 mt-2">Everything you need to turn "We should go" into "We are going!"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[500px]">
        
        {/* Box 1: Large Box - Collaborative Planning */}
        <div className="md:col-span-2 md:row-span-2 bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="bg-orange-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-2xl">
              🗳️
            </div>
            <h3 className="text-2xl font-bold mb-2">Live Itinerary Voting</h3>
            <p className="text-gray-400">Stop the WhatsApp chaos. Friends vote on hotels, spots, and dates in real-time.</p>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors"></div>
        </div>

        {/* Box 2: Tall Box - Split Costs */}
        <div className="md:col-span-1 md:row-span-2 bg-orange-100 rounded-3xl p-8 relative group overflow-hidden border border-orange-200">
          <div className="relative z-10">
            <h3 className="text-xl font-black text-orange-900 mb-2">Smart Split 💸</h3>
            <p className="text-orange-800 text-sm font-medium mb-6">
              We track who paid for what. Settle debts instantly.
            </p>
            
            {/* Visual Fake Receipt */}
            <div className="bg-white p-3 rounded-xl shadow-sm opacity-90 rotate-3 group-hover:rotate-0 transition-transform">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Dinner</span>
                <span>₹4,500</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-900">
                <span>Your Share</span>
                <span>₹1,500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Box 3: Wide Box - Real Avatars */}
        <div className="md:col-span-1 bg-blue-50 rounded-3xl p-6 border border-blue-100 flex flex-col justify-between">
           <div>
             <h3 className="text-lg font-bold text-blue-900">Who's Free?</h3>
             <p className="text-sm text-blue-700">Calendar Sync</p>
           </div>
           <div className="flex -space-x-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-green-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-blue-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-red-400 border-2 border-white"></div>
           </div>
        </div>

        {/* Box 4: Wide Box - Chat */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
           <div>
             <h3 className="text-lg font-bold text-gray-900">Group Chat</h3>
             <p className="text-xs text-green-500 font-bold">● 3 Online</p>
           </div>
           <div className="bg-gray-100 p-3 rounded-full group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
             💬
           </div>
        </div>

      </div>
    </section>
  );
};

export default Features;