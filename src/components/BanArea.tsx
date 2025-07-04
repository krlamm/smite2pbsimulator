import React from 'react';
import { Character } from '../types';
import { getGodImageUrl } from '../utils/imageUtils';

interface BanAreaProps {
  bansA: Character[];
  bansB: Character[];
  mode: 'standard' | 'freedom';
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

function BanArea({ bansA, bansB, mode, onDragOver, onDrop, onDragLeave }: BanAreaProps) {
  const emptyBanSlots = Array(3).fill(null);

  return (
    <div className="ban-area">
      {/* Ban Section Label */}
      <div className="ban-section-label team-a">BANS</div>
      
      {/* Team A Bans */}
      <div className="team-bans team-a">
        {emptyBanSlots.map((_, index) => {
          const ban = bansA[index];
          return (
            <div
              key={`ban-a-${index}`}
              className={`ban-slot portrait ${mode === 'freedom' && !ban ? 'empty' : ''}`}
              onDragOver={mode === 'freedom' ? onDragOver : undefined}
              onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
              onDrop={mode === 'freedom' ? (e) => onDrop(e, 'A', 'ban', index) : undefined}
            >
              {ban ? (
                <div className="god-card">
                  <img src={getGodImageUrl(ban)} alt={ban.name} />
                  <div className="god-info">
                    <div className="god-name">{ban.name}</div>
                  </div>
                </div>
              ) : (
                <div className="empty-slot">?</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="ban-spacer"></div>
      
      {/* Team B Bans */}
      <div className="team-bans team-b">
        {emptyBanSlots.map((_, index) => {
          const ban = bansB[index];
          return (
            <div
              key={`ban-b-${index}`}
              className={`ban-slot portrait ${mode === 'freedom' && !ban ? 'empty' : ''}`}
              onDragOver={mode === 'freedom' ? onDragOver : undefined}
              onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
              onDrop={mode === 'freedom' ? (e) => onDrop(e, 'B', 'ban', index) : undefined}
            >
              {ban ? (
                <div className="god-card">
                  <img src={getGodImageUrl(ban)} alt={ban.name} />
                  <div className="god-info">
                    <div className="god-name">{ban.name}</div>
                  </div>
                </div>
              ) : (
                <div className="empty-slot">?</div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Ban Section Label */}
      <div className="ban-section-label team-b">BANS</div>
    </div>
  );
}

export default BanArea; 