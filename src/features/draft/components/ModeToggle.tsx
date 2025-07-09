import React from 'react';

interface ModeToggleProps {
  mode: 'standard' | 'freedom';
  onModeChange: (mode: 'standard' | 'freedom') => void;
}

function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
      <div className={`bg-gray-800 rounded-full p-1 relative flex cursor-pointer w-52`}>
        <div 
          className={`flex-1 flex items-center justify-center z-10 font-bold transition-colors duration-300 text-lg ${mode === 'standard' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => onModeChange('standard')}
        >
          Pick/Ban
        </div>
        <div 
          className={`flex-1 flex items-center justify-center z-10 font-bold transition-colors duration-300 text-lg ${mode === 'freedom' ? 'text-white' : 'text-gray-400'}`}
          onClick={() => onModeChange('freedom')}
        >
          Free
        </div>
        <div className={`absolute top-1 left-1 w-1/2 h-[calc(100%-8px)] rounded-full transition-transform duration-300 ${mode === 'freedom' ? 'transform translate-x-[calc(100%-8px)] bg-red-500' : 'bg-teal-500'}`}></div>
      </div>
  );
}

export default ModeToggle;
