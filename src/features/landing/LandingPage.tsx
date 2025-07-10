import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">
      <h1 className="text-4xl font-bold text-white mb-8">SMITE 2 Draft Simulator</h1>
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
    </div>
  );
};

export default LandingPage;
