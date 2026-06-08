import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Header = ({ user, onLoginClick, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null);
  const navigate = useNavigate();

  const linkClass = (name) =>
    `flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all font-semibold text-sm ${activeLink === name
      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500'
      : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
    }`;

  const handleNavigation = (path, name) => {
    setActiveLink(name);
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ── Main Top Header ── */}
      <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 lg:px-12 sticky top-0 z-40 border-b border-gray-100/50">

        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <img
              src="/Falcon.jpg"
              alt="TripCircle Logo"
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200"
            />
            <h1 className="text-xl font-black tracking-tight text-gray-900">TripCircle</h1>
          </Link>
        </div>

        {/* Right: Quick user actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <p className="text-sm font-bold text-gray-900 hidden md:block">{user.name}</p>

              <button
                onClick={() => navigate(`/profile/${user.uid}`)}
                className="h-10 w-10 rounded-full bg-orange-100 p-0.5 border-2 border-orange-300 shadow-sm overflow-hidden hover:border-orange-500 transition-colors"
                title="View Profile"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                  alt="profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </button>

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

      {/* ── Dark overlay (click anywhere outside to close) ── */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* ── Slide-out Drawer ── */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.05)] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex flex-col h-full">

          {/* Drawer header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-black tracking-tight text-gray-900">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              className="text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-2 text-sm font-semibold flex-1">
            <button
              onClick={() => handleNavigation('/my-trips', 'trips')}
              className={linkClass('trips')}
            >
              ✈️ My Itineraries
            </button>
            
            <button
              onClick={() => handleNavigation('/trips', 'all-trips')}
              className={linkClass('all-trips')}
            >
              🌍 All Trips
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNavigation('/inbox', 'inbox')}
                  className={linkClass('inbox')}
                >
                  💬 Messages
                </button>
                <button
                  onClick={() => handleNavigation(`/profile/${user.uid}`, 'profile')}
                  className={linkClass('profile')}
                >
                  👤 Profile Settings
                </button>
              </>
            )}

            <button
              onClick={() => handleNavigation('/settings', 'saved')}
              className={linkClass('saved')}
            >
              ❤️ Saved Deals
            </button>

            <button
              onClick={() => handleNavigation('/settings', 'community')}
              className={linkClass('community')}
            >
              🌍 Campus Community
            </button>
          </nav>

          {/* Footer */}
          <div className="text-xs text-gray-400 mt-auto">
            <p className="font-semibold text-gray-500">TripCircle v1.0.0</p>
            <p>Capstone Project</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;