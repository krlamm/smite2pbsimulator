import React from 'react';

interface AspectToggleProps {
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  position: 'left' | 'right';
}

const AspectToggle: React.FC<AspectToggleProps> = ({ isActive, isDisabled, onClick, position }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`absolute top-1 ${position === 'left' ? 'left-1' : 'right-1'} w-16 h-16 rounded-sm border transition-all duration-200 flex items-center justify-center z-10 ${
        isDisabled 
          ? 'border-gray-600 bg-black/30 cursor-default opacity-50' 
          : isActive 
            ? 'border-orange-500 bg-orange-500/20 shadow-lg hover:bg-orange-500/30 shadow-orange-500/30' 
            : 'border-gray-500 bg-black/50 hover:border-gray-400 hover:bg-black/70 cursor-pointer'
      }`}
      title={isDisabled ? 'Select a god first' : isActive ? 'Aspect: ON' : 'Aspect: OFF'}
    >
      <img 
        src="/720px-Aspect_Burst.png" 
        alt="Aspect" 
        className={`w-14 h-14 object-contain transition-all duration-200 ${
          isDisabled 
            ? 'opacity-30 grayscale' 
            : isActive 
              ? 'opacity-100 brightness-110 drop-shadow-sm' 
              : 'opacity-50 grayscale'
        }`}
      />
    </button>
  );
};

export default AspectToggle;