import React from 'react';

const Login = ({ onLogin, onBack }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full p-2"
        >
          ✕
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-2xl bg-orange-100 mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">Welcome to TripCircle</h2>
            <p className="text-gray-500 mt-2 text-sm">Plan your next adventure with friends.</p>
          </div>

          {/* 1. Google Login Button (The Real Feature) */}
          <button 
            onClick={onLogin} // This triggers handleGoogleLogin from App.jsx
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl transition-all duration-200 group"
          >
            <img 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              className="w-6 h-6 group-hover:scale-110 transition-transform" 
              alt="Google"
            />
            Continue with Google
          </button>

          {/* 2. Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Or log in with email</span>
            </div>
          </div>

          {/* 3. Traditional Form (Visual Placeholder for now) */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5 outline-none transition-all"
              />
            </div>
            
            <button 
              type="button" // Prevent form submit
              onClick={() => alert("Please use the Google Login button above for this demo!")}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg shadow-gray-900/20 active:scale-95 transition-all"
            >
              Sign In
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            By continuing, you agree to our <a href="#" className="underline hover:text-gray-600">Terms</a> and <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>
        
        {/* Bottom Decoration */}
        <div className="h-2 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600"></div>
      </div>
    </div>
  );
};

export default Login;