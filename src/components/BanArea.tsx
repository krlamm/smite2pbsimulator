import React from 'react';
import { Character } from '../types';
import { getGodImageUrl } from '../utils/imageUtils';

interface BanAreaProps {
  // HIGHLIGHTED CHANGE: Allow Character | null in the arrays
  bansA: (Character | null)[];
  bansB: (Character | null)[];
  mode: 'standard' | 'freedom';
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

function BanArea({ bansA, bansB, mode, onDragOver, onDrop, onDragLeave }: BanAreaProps) {
  // HIGHLIGHTED CHANGE: Corrected to 3, to render only 3 ban slots per team
  const emptyBanSlots = Array(3).fill(null);

  return (
    <div className="flex justify-center items-center gap-4  px-5 py-3  w-full">
      {/* Team A Bans */}
      {emptyBanSlots.map((_, index) => {
        const ban = bansA[index]; // ban will now correctly be Character | null
        return (
          <div
            key={`ban-a-${index}`}
            className={`m-0 h-full bg-black/40 border-2 rounded-md flex items-center justify-center overflow-hidden aspect-square min-w-[60px] max-w-[120px] max-h-[120px] border-order shadow-[0_0_5px_rgba(0,204,255,0.5)] ${
              mode === 'freedom' && !ban ? 'border-dashed border-gray-500 bg-gray-500/20 cursor-pointer hover:border-gray-400 hover:bg-gray-500/30' : ''
            }`}
            onDragOver={mode === 'freedom' ? onDragOver : undefined}
            onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
            onDrop={mode === 'freedom' ? (e) => onDrop(e, 'A', 'ban', index) : undefined}
          >
            {ban ? (
              <div className="relative w-full h-full overflow-hidden block">
                <img src={getGodImageUrl(ban)} alt={ban.name} className="absolute top-0 left-0 w-full h-full object-cover object-top z-10 block" />
                <div className="absolute bottom-0 left-0 w-full text-center z-20 bg-gradient-to-t from-black/90 to-transparent p-1 text-sm font-bold leading-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">{ban.name}</div>
              </div>
            ) : (
              <div className="empty-slot">?</div>
            )}
          </div>
        );
      })}

      {/* Spacer */}
      <div className="text-base font-bold uppercase px-4 text-chaos">BANS</div>

      {/* Team B Bans */}
      {emptyBanSlots.map((_, index) => {
        const ban = bansB[index]; // ban will now correctly be Character | null
        return (
          <div
            key={`ban-b-${index}`}
            className={`m-0 bg-black/40 border-2 rounded-md flex items-center justify-center overflow-hidden h-[90%] aspect-square min-w-[60px] min-h-[60px] max-w-[120px] max-h-[120px] border-chaos shadow-[0_0_5px_rgba(255,51,102,0.5)] ${
              mode === 'freedom' && !ban ? 'border-dashed border-gray-500 bg-gray-500/20 cursor-pointer hover:border-gray-400 hover:bg-gray-500/30' : ''
            }`}
            onDragOver={mode === 'freedom' ? onDragOver : undefined}
            onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
            onDrop={mode === 'freedom' ? (e) => onDrop(e, 'B', 'ban', index) : undefined}
          >
            {ban ? (
              <div className="relative w-full h-full overflow-hidden block">
                <img src={getGodImageUrl(ban)} alt={ban.name} className="absolute top-0 left-0 w-full h-full object-cover object-top z-10 block" />
                <div className="absolute bottom-0 left-0 w-full text-center z-20 bg-gradient-to-t from-black/90 to-transparent p-1 text-sm font-bold leading-tight text-white whitespace-nowrap overflow-hidden text-ellipsis">{ban.name}</div>
              </div>
            ) : (
              <div className="empty-slot">?</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BanArea;