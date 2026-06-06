import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Settings</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Manage your profile preferences, notifications, and account settings. This feature is under development.
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
      >
        Go Back
      </button>
    </div>
  );
};

export default Settings;
