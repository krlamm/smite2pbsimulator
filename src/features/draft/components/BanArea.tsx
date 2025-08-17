import React from 'react';
import { Character } from '../../../types';
import { useDraftContext } from '../context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';

interface BanAreaProps {
  bansA: (Character | null)[];
  bansB: (Character | null)[];
}

const BanArea: React.FC<BanAreaProps> = ({ bansA, bansB }) => {
  const { mode, handleDragOver, handleDragLeave, handleDrop, handleStandardDrop } = useDraftContext();

  const renderBanSlots = (team: 'A' | 'B', bans: (Character | null)[]) => (
    <div className={`flex gap-2.5 ${team === 'A' ? 'justify-start' : 'justify-end'}`}>
      {bans.map((ban, index) => (
        <div
          key={index}
          className="w-24 h-32 bg-black/50 border-2 border-gray-500 rounded-md flex items-center justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => mode === 'freedom' ? handleDrop(e, team, 'ban', index) : handleStandardDrop(e, team, 'ban', index)}
        >
          {ban && <img src={getGodImageUrl(ban)} alt={ban.name} className="w-full h-full object-cover" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex justify-between items-center p-4 bg-black/30 rounded-md mb-4">
      {renderBanSlots('A', bansA)}
      <div className="text-2xl font-bold text-gray-400">BANS</div>
      {renderBanSlots('B', bansB)}
    </div>
  );
};

export default BanArea;
