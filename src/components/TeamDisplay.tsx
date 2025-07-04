import React from 'react';
import { Character } from '../types';
import { getGodImageUrl } from '../utils/imageUtils';

interface TeamDisplayProps {
  team: 'A' | 'B';
  picks: Character[];
  bans: Character[];
  mode: 'standard' | 'freedom';
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, team: 'A' | 'B', type: 'pick' | 'ban', index: number) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

function TeamDisplay({ team, picks, bans, mode, onDragOver, onDrop, onDragLeave }: TeamDisplayProps) {
  const emptyBanSlots = Array(3).fill(null);
  const emptyPickSlots = Array(5).fill(null);

  return (
    <div className={`team-display team-${team}`}>
      <h2>{team === 'A' ? 'Order' : 'Chaos'}</h2>
      <div className="bans">
        <h3>Bans</h3>
        <div className="ban-list">
          {emptyBanSlots.map((_, index) => {
            const ban = bans[index];
            return (
              <div
                key={index}
                className={`ban-item ${mode === 'freedom' && !ban ? 'empty' : ''}`}
                onDragOver={mode === 'freedom' ? onDragOver : undefined}
                onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
                onDrop={mode === 'freedom' ? (e) => onDrop(e, team, 'ban', index) : undefined}
              >
                {ban ? (
                  <>
                    <img src={getGodImageUrl(ban)} alt={ban.name} />
                    <div className="ban-info">
                      <div className="character-name">{ban.name}</div>
                      <div className={`character-role role-${ban.roles[0].toLowerCase()}`}>{ban.roles[0]}</div>
                    </div>
                  </>
                ) : (
                  <div className="empty-slot">?</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="picks">
        <h3>Picks</h3>
        <div className="pick-list">
          {emptyPickSlots.map((_, index) => {
            const pick = picks[index];
            return (
              <div
                key={index}
                className={`pick-item ${mode === 'freedom' && !pick ? 'empty' : ''}`}
                onDragOver={mode === 'freedom' ? onDragOver : undefined}
                onDragLeave={mode === 'freedom' ? onDragLeave : undefined}
                onDrop={mode === 'freedom' ? (e) => onDrop(e, team, 'pick', index) : undefined}
              >
                {pick ? (
                  <>
                    <img src={getGodImageUrl(pick)} alt={pick.name} />
                    <div className="pick-info">
                      <div className="character-name">{pick.name}</div>
                      <div className={`character-role role-${pick.roles[0].toLowerCase()}`}>{pick.roles[0]}</div>
                    </div>
                  </>
                ) : (
                  <div className="empty-slot">?</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TeamDisplay; 