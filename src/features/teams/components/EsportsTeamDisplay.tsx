import React from 'react';
import { Character } from '../../../types';
import { useDraftContext } from '../../draft/context/DraftContext';
import { getGodImageUrl } from '../../../utils/imageUtils';

interface EsportsTeamDisplayProps {
  team: 'A' | 'B';
  picks: (Character | null)[];
  bans: (Character | null)[];
}

const EsportsTeamDisplay: React.FC<EsportsTeamDisplayProps> = ({ team, picks }) => {
  const { mode, handleDragOver, handleDragLeave, handleDrop, handleStandardDrop } = useDraftContext();
  const emptyPickSlots = Array(5).fill(null);

  return (
    <div className={`flex flex-col w-1/7 gap-2 py-2`}>
      {/* Vertical Pick Slots */}
      {emptyPickSlots.map((_, index) => {
        const pick = picks[index];
        return (
          <div
            key={index}
            className={`border-2 rounded-md flex items-center h-full justify-center overflow-hidden bg-no-repeat relative ${
              team === 'A'
                ? 'border-order shadow-border-glow'
                : 'border-chaos shadow-[0_0_5px_rgba(255,51,102,0.7)]'
            } ${mode === 'freedom' && !pick ? 'border-dashed border-gray-500 bg-gray-500/20 cursor-pointer hover:border-gray-400 hover:bg-gray-500/30' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => mode === 'freedom' ? handleDrop(e, team, 'pick', index) : handleStandardDrop(e, team, 'pick', index)}
          >
            {pick ? (
              <>
                <img src={getGodImageUrl(pick)} alt={pick.name} className="absolute top-0 left-0 w-full h-full object-cover object-top z-10 block" />
                <div className="text-white text-2xl opacity-80 absolute bottom-0 left-0 right-0 h-auto text-center p-1.5 whitespace-normal break-words">{pick.name}</div>
              </>
            ) : (
              <div className="empty-slot text-4xl">?</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default EsportsTeamDisplay;