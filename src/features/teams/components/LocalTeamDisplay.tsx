import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';
import { Character } from '../../../types';

interface LocalTeamDisplayProps {
  team: 'A' | 'B';
  picks: (Character | null)[];
}

const LocalTeamDisplay: React.FC<LocalTeamDisplayProps> = ({ team, picks }) => {
  const { currentTeam, phase } = useDraftContext();
  const teamColor = team === 'A' ? 'border-order' : 'border-chaos';

  const pickOrder = team === 'A' ? [0, 3, 4, 7, 8] : [1, 2, 5, 6, 9];

  return (
    <div className={`flex flex-col w-1/5 gap-2 py-2`}>
      {Array.from({ length: 5 }).map((_, slotIndex) => {
        const pick = picks[slotIndex];
        const pickTurn = pickOrder[slotIndex];
        
        // This logic needs to be adapted from the useDraft hook's internal state
        // For now, we'll base it on the context's phase and currentTeam
        const currentPickTurn = 0; // This will need a more robust way to track turns locally
        const isActiveTurn = phase === 'PICK' && currentTeam === team && pickTurn === currentPickTurn && !pick;

        return (
          <div
            key={slotIndex}
            className={`border-2 rounded-md flex flex-col h-full justify-between overflow-hidden bg-black/30 relative ${teamColor} ${isActiveTurn ? 'shadow-[0_0_15px_5px_#ffdf00]' : ''}`}
          >
            <div className="text-center p-1 bg-black/50">
              <p className="font-bold text-white">{team === 'A' ? 'Order' : 'Chaos'} Pick {slotIndex + 1}</p>
            </div>
            <div className="flex-grow flex items-center justify-center">
              {pick ? (
                <img 
                  src={getGodImageUrl(pick)} 
                  alt={pick.name} 
                  className="w-full h-full object-cover"
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
          </div>
        );
      })}
    </div>
  );
};

export default LocalTeamDisplay;
