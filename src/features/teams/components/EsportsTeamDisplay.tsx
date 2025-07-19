import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';
import { Character } from '../../../types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase';

import { Player } from '../../../types';

interface EsportsTeamDisplayProps {
  team: 'A' | 'B';
}

const EsportsTeamDisplay: React.FC<EsportsTeamDisplayProps> = ({ team }) => {
  const { initialState, currentUser, draftId } = useDraftContext();

  if (!initialState) {
    return <div className="w-1/5">Loading Team...</div>;
  }

  const teamKey = team === 'A' ? 'teamA' : 'teamB';
  const teamData = initialState[teamKey];
  const teamColor = team === 'A' ? 'border-order' : 'border-chaos';

  if (!teamData) {
    return <div className="w-1/5">Loading Team Data...</div>;
  }

  const captainId = teamData.captain;

  // Get the original indices of the pick actions for this team.
  // These indices correspond to the keys in the `initialState.picks` map.
  const teamPickOrderIndices = initialState.pickOrder
    .map((p, index) => ({ ...p, originalIndex: index }))
    .filter(p => p.type === 'pick' && p.team === teamKey)
    .map(p => p.originalIndex);

  // Ensure we always render 5 slots, even if pickOrder is not fully populated.
  while (teamPickOrderIndices.length < 5) {
    teamPickOrderIndices.push(-1); // Use -1 or another indicator for an empty slot
  }

  return (
    <div className={`flex flex-col w-1/5 gap-2 py-2`}>
      {teamPickOrderIndices.map((pickIndex, slotIndex) => {
        if (pickIndex === -1) {
          // Render an empty slot if pickOrder isn't populated for this slot
          return <div key={`empty-${slotIndex}`} className={`border-2 rounded-md h-full bg-black/30 ${teamColor}`}></div>;
        }

        const playerForSlotUID = initialState.pickOrder[pickIndex].uid;
        const playerInfo = teamData.players[playerForSlotUID];
        const pickData = initialState.picks?.[pickIndex];

        const pick = pickData ? { name: pickData.character, image: getGodImageUrl({ name: pickData.character } as Character) } : null;
        const isCaptain = playerInfo?.uid === captainId;
        const isActiveTurn = initialState.currentPickIndex === pickIndex;

        return (
          <div
            key={pickIndex}
            className={`border-2 rounded-md flex flex-col h-full justify-between overflow-hidden bg-black/30 relative ${teamColor} ${isActiveTurn ? 'shadow-[0_0_15px_5px_#ffdf00]' : ''}`}
          >
            <div className="text-center p-1 bg-black/50 flex justify-between items-center">
              <p className="font-bold text-white truncate">{playerInfo?.displayName || 'Empty Slot'}</p>
              {isCaptain && <p className="text-xs text-yellow-400">Captain</p>}
            </div>
            <div className="flex-grow flex items-center justify-center">
              {pick ? (
                <img 
                  src={pick.image} 
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

export default EsportsTeamDisplay;
