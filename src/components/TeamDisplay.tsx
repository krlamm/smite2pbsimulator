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

  // Helper to render god portrait (handles placeholder/fallback logic)
  const renderCharacterImg = (char: Character) => {
    const isPlaceholder = char.image.includes('placeholder');
    const slug = char.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const candidateUrls: string[] = [
      `https://webcdn.hirezstudios.com/smite/god-icons/${slug}.jpg`,
      `https://webcdn.hirezstudios.com/smite2/god-icons/${slug}.jpg`,
    ];

    const initialSrc = isPlaceholder ? candidateUrls[0] : char.image;

    return (
      <img
        src={initialSrc}
        alt={char.name}
        data-candidate-index={0}
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          const currentIndex = Number(img.dataset.candidateIndex) || 0;
          const nextIndex = currentIndex + 1;
          if (isPlaceholder && nextIndex < candidateUrls.length) {
            img.dataset.candidateIndex = String(nextIndex);
            img.src = candidateUrls[nextIndex];
          }
        }}
      />
    );
  };

  return (
    <div className={`team-display team-${team}`}>
      <h2>{team === 'A' ? 'Order' : 'Chaos'}</h2>
      
      <div className="bans">
        <h3>Bans</h3>
        <div className="ban-list">
          {bans.slice(0, 3).map((character, index) => (
            <div key={index} className="ban-item">
              {renderCharacterImg(character)}
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

        {/* Order gets first pick centered */}
        {team === 'A' && (
          <div className="first-pick-row">
            {picks[0] ? (
              <div className="pick-item">
                {renderCharacterImg(picks[0])}
              </div>
            ) : (
              <div className="pick-item empty"><div className="empty-slot">?</div></div>
            )}
          </div>
        )}

        {/* Remaining picks list */}
        <div className="pick-list">
          {(() => {
            if (team === 'B') {
              // Chaos: render first four picks (indices 0-3)
              return picks.slice(0, 4).map((character, idx) => (
                <div key={idx} className="pick-item">
                  {renderCharacterImg(character)}
                </div>
              ));
            }
            // Order: skip first pick already rendered
            return picks.slice(1, 5).map((character, idx) => (
              <div key={idx} className="pick-item">
                {renderCharacterImg(character)}
              </div>
            ));
          })()}

          {/* Empty slots*/}
          {(() => {
            if (team === 'A') {
              // Protect against negative index when no picks have been made yet
              const effectivePicked = Math.max(picks.length - 1, 0);
              const empties = Math.max(0, 4 - effectivePicked);
              return [...Array(empties)].map((_, index) => (
                <div key={`empty-pick-${index}`} className="pick-item empty">
                  <div className="empty-slot">?</div>
                </div>
              ));
            }
            // Chaos: compute empties for first 4 slots
            const empties = Math.max(0, 4 - Math.min(picks.length, 4));
            return [...Array(empties)].map((_, index) => (
              <div key={`empty-pick-${index}`} className="pick-item empty">
                <div className="empty-slot">?</div>
              </div>
            ));
          })()}
        </div>

        {/* Chaos last pick centered */}
        {team === 'B' && (
          <div className="last-pick-row">
            {picks[4] ? (
              <div className="pick-item">
                {renderCharacterImg(picks[4])}
              </div>
            ) : (
              <div className="pick-item empty"><div className="empty-slot">?</div></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamDisplay; 