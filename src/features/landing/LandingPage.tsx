import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <h1 className="text-4xl font-bold tracking-[2px] text-gold mb-4 text-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
        SMITE 2 PICK/BAN SIMULATOR
      </h1>
      <div className="text-chaos text-2xl text-shadow-border-glow mb-8">
        BETA - NOT FINAL
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/local')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded"
        >
          1-Player Draft
        </button>
        <button
          onClick={() => navigate('/online')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded"
        >
          2-Player Draft
        </button>
      </div>
      <div className="absolute top-4 right-4">
        <button
          onClick={() => alert('Coming Soon')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
