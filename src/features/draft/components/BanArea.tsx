import React from 'react';
import { Character } from '../../../types';
import { useDraftContext } from '../context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';

interface BanAreaProps {
  bansA: (Character | null)[];
  bansB: (Character | null)[];
}

const BanArea: React.FC<BanAreaProps> = ({ bansA, bansB }) => {
  const { mode, phase, currentTeam, handleDragOver, handleDragLeave, handleDrop, handleStandardDrop } = useDraftContext();

  const renderBanSlots = (team: 'A' | 'B', bans: (Character | null)[]) => {
    // Calculate which ban slot should be active
    const totalBans = [...bansA, ...bansB].filter(Boolean).length;
    
    return (
      <div className={`flex gap-2.5 ${team === 'A' ? 'justify-start' : 'justify-end'}`}>
        {bans.map((ban, index) => {
          // Determine if this ban slot should glow
          let isActiveTurn = false;
          
          if (phase === 'BAN' && !ban) {
            // Calculate which ban turn we're on (0-5 for 6 total bans)
            // Ban sequence: A(0), B(0), A(1), B(1), A(2), B(2)
            const teamBanCount = bans.filter(Boolean).length;
            const expectedBanIndex = teamBanCount;
            
            // Check if it's this team's turn and this is the next ban slot
            if (team === currentTeam && index === expectedBanIndex) {
              isActiveTurn = true;
            }
          }
          
          return (
            <div
              key={index}
              className={`w-24 h-32 bg-black/50 border-2 border-gray-500 rounded-md flex items-center justify-center ${
                isActiveTurn ? 'shadow-[0_0_15px_5px_#ffdf00]' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => mode === 'freedom' ? handleDrop(e, team, 'ban', index) : handleStandardDrop(e, team, 'ban', index)}
            >
              {ban && <img src={getGodImageUrl(ban)} alt={ban.name} className="w-full h-full object-cover" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex justify-between items-center p-4 bg-black/30 rounded-md mb-4">
      {renderBanSlots('A', bansA)}
      <div className="text-2xl font-bold text-gray-400">BANS</div>
      {renderBanSlots('B', bansB)}
    </div>
  );
};

export default BanArea;
