import React from 'react';
import { Character } from '../types';

interface TeamDisplayProps {
  team: 'A' | 'B';
  picks: Character[];
  bans: Character[];
}

function TeamDisplay({ team, picks, bans }: TeamDisplayProps) {
  // Calculate remaining slots, ensuring non-negative values
  const remainingBans = Math.max(0, 3 - bans.length);
  const remainingPicks = Math.max(0, 5 - picks.length);

  return (
    <div className={`team-display team-${team}`}>
      <h2>{team === 'A' ? 'Order' : 'Chaos'}</h2>
      
      <div className="bans">
        <h3>Bans</h3>
        <div className="ban-list">
          {bans.slice(0, 3).map((character, index) => (
            <div key={index} className="ban-item">
              <img src={character.image} alt={character.name} />
              <div className="ban-info">
                <div className="character-name">{character.name}</div>
                <div className="character-role">{character.role}</div>
              </div>
            </div>
          ))}
          {[...Array(remainingBans)].map((_, index) => (
            <div key={`empty-ban-${index}`} className="ban-item empty">
              <div className="empty-slot">?</div>
            </div>
          ))}
        </div>
      </div>

      <div className="picks">
        <h3>Picks</h3>
        <div className="pick-list">
          {picks.slice(0, 5).map((character, index) => (
            <div key={index} className="pick-item">
              <img src={character.image} alt={character.name} />
              <div className="pick-info">
                <div className="character-name">{character.name}</div>
                <div className="character-role">{character.role}</div>
              </div>
            </div>
          ))}
          {[...Array(remainingPicks)].map((_, index) => (
            <div key={`empty-pick-${index}`} className="pick-item empty">
              <div className="empty-slot">?</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamDisplay; 