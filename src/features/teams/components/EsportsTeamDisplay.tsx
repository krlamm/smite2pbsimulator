import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';
import { gods } from '../../../constants/gods'; // Import the gods constant
import AspectToggle from './AspectToggle';

interface EsportsTeamDisplayProps {
  team: 'A' | 'B';
}

const EsportsTeamDisplay: React.FC<EsportsTeamDisplayProps> = ({ team }) => {
  const { initialState, aspects, toggleAspect } = useDraftContext();

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

  const teamPickOrderIndices = initialState.pickOrder
    .map((p, index) => ({ ...p, originalIndex: index }))
    .filter(p => p.type === 'pick' && p.team === teamKey)
    .map(p => p.originalIndex);

  while (teamPickOrderIndices.length < 5) {
    teamPickOrderIndices.push(-1);
  }

  // Determine the active pick window
  const { pickOrder, currentPickIndex, status } = initialState;
  let activePickWindow: number[] = [];
  if (status === 'picking' && currentPickIndex < pickOrder.length) {
    const currentTeam = pickOrder[currentPickIndex].team;
    if (teamKey === currentTeam) {
      for (let i = currentPickIndex; i < pickOrder.length; i++) {
        if (pickOrder[i].team === currentTeam && pickOrder[i].type === 'pick') {
          activePickWindow.push(i);
        } else {
          break;
        }
      }
    }
  } else if (status === 'banning' && pickOrder[currentPickIndex]?.team === teamKey) {
    activePickWindow.push(currentPickIndex);
  }


  return (
    <div className={`flex flex-col w-1/5 gap-2 py-2`}>
      {teamPickOrderIndices.map((pickIndex, slotIndex) => {
        if (pickIndex === -1) {
          return <div key={`empty-${slotIndex}`} className={`border-2 rounded-md h-full bg-black/30 ${teamColor}`}></div>;
        }

        const playerForSlotUID = initialState.pickOrder[pickIndex].uid;
        const playerInfo = teamData.players[playerForSlotUID];
        const pickData = initialState.picks?.[pickIndex];

        const character = pickData ? gods.find(g => g.name === pickData.character) : null;
        const pick = character ? { name: character.name, image: getGodImageUrl(character) } : null;
        
        const isCaptain = playerInfo?.uid === captainId;
        const isActiveTurn = activePickWindow.includes(pickIndex) && !pickData;

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

export default EsportsTeamDisplay;
