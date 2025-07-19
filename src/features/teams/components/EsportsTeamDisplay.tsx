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

  const handleTrade = async (targetPlayerId: string) => {
    if (!currentUser || !draftId || !initialState) return;

    const teamData = initialState[teamKey];
    const fromPlayer = teamData.players[currentUser.uid];
    const toPlayer = teamData.players[targetPlayerId];

    if (!fromPlayer || !toPlayer || !fromPlayer.pick || !toPlayer.pick) {
      console.error("Both players must have picked a character to trade.");
      return;
    }

    const tradeRequest = {
      from: currentUser.uid,
      fromName: fromPlayer.displayName,
      fromPick: fromPlayer.pick,
      to: targetPlayerId,
      toName: toPlayer.displayName,
      toPick: toPlayer.pick,
      status: 'pending', // pending, accepted, declined
    };

    await addDoc(collection(db, 'drafts', draftId, 'tradeRequests'), tradeRequest);
  };

  const teamKey = team === 'A' ? 'teamA' : 'teamB';
  const teamData = initialState[teamKey];
  const teamColor = team === 'A' ? 'border-order' : 'border-chaos';

  if (!teamData) {
    // Fallback for old data structure or loading states
    return (
      <div className={`flex flex-col w-1/5 gap-2 py-2`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={`border-2 rounded-md h-full bg-black/30 ${teamColor}`}>
             <div className="text-center p-1 bg-black/50">
              <p className="font-bold text-white truncate">Empty Slot</p>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-4xl text-gray-500">?</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const captainId = teamData.captain;

  const players: Player[] = Object.entries(teamData.players).map(([uid, player]) => ({ uid, ...(player as Omit<Player, 'uid'>) }));
  const currentUserPlayer = players.find(p => p.uid === currentUser?.uid);

  const slots = Array.from({ length: 5 }).map((_, index) => {
    return players[index] || null;
  });

  return (
    <div className={`flex flex-col w-1/5 gap-2 py-2`}>
      {slots.map((player, index) => {
        if (!player) {
          return <div key={index} className={`border-2 rounded-md h-full bg-black/30 ${teamColor}`}></div>;
        }
        
        const pick = player.pick ? { name: player.pick, image: getGodImageUrl({ name: player.pick } as Character) } : null;
        const isCaptain = player.uid === captainId;
        const isActiveTurn = initialState.pickOrder[initialState.currentPickIndex]?.uid === player.uid;
        const canTradeWith = currentUserPlayer?.pick && pick && currentUserPlayer.uid !== player.uid;

        return (
          <div
            key={index}
            className={`border-2 rounded-md flex flex-col h-full justify-between overflow-hidden bg-black/30 relative ${teamColor} ${isActiveTurn ? 'shadow-[0_0_15px_5px_#ffdf00]' : ''}`}
          >
            <div className="text-center p-1 bg-black/50 flex justify-between items-center">
              <div>
                <p className="font-bold text-white truncate">{player.displayName}</p>
                {isCaptain && <p className="text-xs text-yellow-400">Captain</p>}
              </div>
              {canTradeWith && (
                <button onClick={() => handleTrade(player.uid)} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded">
                  Trade
                </button>
              )}
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
