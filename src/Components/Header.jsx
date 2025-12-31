import React from 'react';

const Header = ({ user, onLoginClick, onLogout, onMyTripsClick }) => {
  return (
    <header className="h-20 bg-white flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40 border-b border-gray-100/50 backdrop-blur-md bg-white/80">
      
      {/* Left Side: Logo */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
        
        {/* ✅ RESTORED LOGO */}
        <img 
            src="/Falcon.jpg" 
            alt="TripCircle Logo" 
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
        />
        
        <h1 className="text-xl font-black tracking-tight text-gray-900 block">
          TripCircle
        </h1>
      </div>

      {/* Right Side: Navigation */}
      <div className="flex items-center space-x-6">
        
        <button 
          onClick={onMyTripsClick}
          className="hidden sm:block text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors"
        >
          My Trips
        </button>

        {user ? (
           <div className="flex items-center space-x-3">
             <div className="text-right hidden md:block">
               <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
             </div>
             
             <div className="h-10 w-10 rounded-full bg-orange-100 p-0.5 border-2 border-white shadow-sm overflow-hidden">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt="profile" className="w-full h-full object-cover rounded-full" />
             </div>

             <button 
               onClick={onLogout}
               className="text-xs text-red-500 font-bold hover:bg-red-50 px-3 py-1 rounded-full transition-colors border border-red-100"
             >
               Logout
             </button>
           </div>
        ) : (
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