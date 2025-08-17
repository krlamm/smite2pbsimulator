import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';
import { Character } from '../../../types';
import AspectToggle from './AspectToggle';

interface LocalTeamDisplayProps {
  team: 'A' | 'B';
  picks: (Character | null)[];
}

const LocalTeamDisplay: React.FC<LocalTeamDisplayProps> = ({ team, picks }) => {
  const { currentTeam, phase, aspects, toggleAspect, picks: allPicks } = useDraftContext();
  const teamColor = team === 'A' ? 'border-order' : 'border-chaos';

  const pickOrder = team === 'A' ? [0, 3, 4, 7, 8] : [1, 2, 5, 6, 9];

  return (
    <div className={`flex flex-col w-1/5 gap-2 py-2`}>
      {Array.from({ length: 5 }).map((_, slotIndex) => {
        const pick = picks[slotIndex];
        
        // Calculate which pick turn we're currently on
        const totalPicks = [...(allPicks?.A || []), ...(allPicks?.B || [])].filter(Boolean).length;
        
        // Check if this is the active pick slot
        let isActiveTurn = false;
        if (phase === 'PICK' && !pick && currentTeam === team) {
          // Count how many picks this team already has
          const teamPickCount = picks.filter(Boolean).length;
          
          // Pick sequence: ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B']
          // Determine how many consecutive picks this team should make
          const pickSequence = ['A', 'B', 'B', 'A', 'A', 'B', 'B', 'A', 'A', 'B'];
          
          // Find current position in the pick sequence
          let consecutivePicksForThisTeam = 0;
          for (let i = totalPicks; i < pickSequence.length && pickSequence[i] === currentTeam; i++) {
            consecutivePicksForThisTeam++;
          }
          
          // This slot should glow if it's one of the next empty slots for this team
          if (slotIndex >= teamPickCount && slotIndex < teamPickCount + consecutivePicksForThisTeam) {
            isActiveTurn = true;
          }
        }

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
            <AspectToggle
              isActive={aspects[team]?.[slotIndex] || false}
              isDisabled={!pick}
              onClick={() => toggleAspect(team, slotIndex)}
              position={team === 'A' ? 'right' : 'left'}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LocalTeamDisplay;
