import React from 'react';

const Header = ({ user, onLoginClick, onLogout }) => {
  return (
    // 1. EXACT LAYOUT FROM YOUR PAST CODE (Far Left / Far Right spacing)
    <header className="h-20 bg-white flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40 border-b border-gray-100/50 backdrop-blur-md bg-white/80">
      
      {/* 2. LEFT SIDE: New TripCircle Logo & Name */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
        {/* Falcon Logo */}
        <img 
            src="/Falcon.jpg" 
            alt="TripCircle Logo" 
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
        />
        {/* New Name */}
        <h1 className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">
          TripCircle
        </h1>
      </div>

      {/* 3. RIGHT SIDE: My Trips & Login (Kept your exact styling) */}
      <div className="flex items-center space-x-6">
        <button className="hidden sm:block text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors">
          My Trips
        </button>

        {user ? (
           // Logged In State
           <div className="flex items-center space-x-3">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
             </div>
             
             {/* Avatar Image */}
             <div className="h-10 w-10 rounded-full bg-orange-100 p-0.5 border-2 border-white shadow-sm overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="profile" className="w-full h-full object-cover rounded-full" />
             </div>

             <button 
               onClick={onLogout}
               className="text-xs text-red-500 font-bold hover:bg-red-50 px-3 py-1 rounded-full transition-colors border border-red-100"
             >
               Logout
             </button>
           </div>
        ) : (
           // Logged Out State
           <button 
             onClick={onLoginClick}
             className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-gray-900/20"
           >
             Log In
           </button>
        )}
      </div>

    </header>
  );
};

export default Header;