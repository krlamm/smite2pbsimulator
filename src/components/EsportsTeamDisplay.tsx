import React from 'react';
import { Character } from '../types';
import { getGodImageUrl } from '../utils/imageUtils';

interface EsportsTeamDisplayProps {
  team: 'A' | 'B';
  picks: Character[];
  bans: Character[];
  mode: 'standard' | 'freedom';
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

function EsportsTeamDisplay({ team, picks, bans, mode, onDragOver, onDrop, onDragLeave }: EsportsTeamDisplayProps) {
  const emptyPickSlots = Array(5).fill(null);

  return (
    <div className={`esports-team-column team-${team.toLowerCase()}`}>
      {/* Vertical Pick Slots */}
      {emptyPickSlots.map((_, index) => {
        const pick = picks[index];
        return (
          <div
            key={index}
            className={`pick-slot ${mode === 'freedom' && !pick ? 'empty' : ''}`}
            onDragOver={mode === 'freedom' ? onDragOver : undefined}
            onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
            onDrop={mode === 'freedom' ? (e) => onDrop(e, team, 'pick', index) : undefined}
          >
            {pick ? (
              <div className="god-card">
                <img src={getGodImageUrl(pick)} alt={pick.name} />
                <div className="god-name picked-god-name">{pick.name}</div>
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

export default EsportsTeamDisplay; 