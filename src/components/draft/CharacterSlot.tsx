import React from 'react';
import { getGodImageUrl } from '../../utils/imageUtils';
import { gods } from '../../constants/gods';
import AspectToggle from '../../features/teams/components/AspectToggle';

interface CharacterSlotProps {
  character?: string;
  isActive?: boolean;
  teamColor: string;
  slotInfo?: {
    playerName?: string;
    isCaptain?: boolean;
  };
  aspectToggle?: {
    isActive: boolean;
    isDisabled: boolean;
    onClick: () => void;
    position: 'left' | 'right';
  };
}

const CharacterSlot: React.FC<CharacterSlotProps> = ({
  character,
  isActive = false,
  teamColor,
  slotInfo,
  aspectToggle
}) => {
  const god = character ? gods.find(g => g.name === character) : null;
  const pick = god ? { name: god.name, image: getGodImageUrl(god) } : null;
  
  const activeGlow = isActive ? 'shadow-[0_0_15px_5px_#ffdf00]' : '';

  return (
    <div
      className={`border-2 rounded-md flex flex-col h-full justify-between overflow-hidden bg-black/30 relative ${teamColor} ${activeGlow}`}
    >
      {slotInfo && (
        <div className="text-center p-1 bg-black/50 flex justify-between items-center">
          <p className="font-bold text-white truncate">{slotInfo.playerName || 'Empty Slot'}</p>
          {slotInfo.isCaptain && <p className="text-xs text-yellow-400">Captain</p>}
        </div>
      )}
      
      <div className="flex-grow flex items-center justify-center">
        {pick ? (
          <img 
            src={pick.image} 
            alt={pick.name} 
            className="w-full h-full object-cover transform -translate-y-40"
          />
        ) : (
          <div className="text-4xl text-gray-500">?</div>
        )}
      </div>
      
      {pick && (
        <div className="text-white text-lg bg-black/70 absolute bottom-0 left-0 right-0 text-center p-1">
          {pick.name}
        </div>
      )}
      
      {aspectToggle && (
        <AspectToggle
          isActive={aspectToggle.isActive}
          isDisabled={aspectToggle.isDisabled}
          onClick={aspectToggle.onClick}
          position={aspectToggle.position}
        />
      )}
    </div>
  );
};

export default CharacterSlot;