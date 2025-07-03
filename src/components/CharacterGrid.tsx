import React, { useState } from 'react';
import { Character, TeamState } from '../types';

interface CharacterGridProps {
  characters: Character[];
  onCharacterSelect: (character: Character) => void;
  picks: TeamState;
  bans: TeamState;
  mode: 'standard' | 'freedom';
  onDragStart: (e: React.DragEvent, character: Character) => void;
}

function CharacterGrid({ 
  characters, 
  onCharacterSelect, 
  picks, 
  bans,
  mode,
  onDragStart 
}: CharacterGridProps) {
  // Initialize to null so no characters are shown on initial load
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const roles = ['All', 'Jungle', 'Support', 'Carry', 'Mid', 'Solo'];

  const isCharacterAvailable = (character: Character): boolean => {
    const allPicks = [...picks.A, ...picks.B];
    const allBans = [...bans.A, ...bans.B];
    return !allPicks.some(pick => pick?.id === character.id) && 
           !allBans.some(ban => ban?.id === character.id);
  };

  // Only filter characters if a role is selected (not null)
  const filteredCharacters = characters.filter(character =>
    selectedRole !== null && (selectedRole === 'All' || character.role === selectedRole)
  );

  // Sort alphabetically when viewing all roles
  const displayCharacters = selectedRole === 'All'
    ? [...filteredCharacters].sort((a, b) => a.name.localeCompare(b.name))
    : filteredCharacters;

  return (
    <div className="character-grid-container">
      <div className="role-filters">
        {roles.map(role => (
          <button
            key={role}
            // Add 'active' class only if the current role matches selectedRole
            className={`role-filter role-${role.toLowerCase()} ${selectedRole === role ? 'active' : ''}`}
            // Toggle selectedRole: if clicking active role, set to null (hide); else set to new role (show)
            onClick={() => setSelectedRole(selectedRole === role ? null : role)}
          >
            {role}
          </button>
        ))}
      </div>
      <div className="character-grid">
        {displayCharacters.map(character => (
          <div
            key={character.id}
            className={`character-card role-${character.role.toLowerCase()} ${!isCharacterAvailable(character) ? 'unavailable' : ''}`}
            onClick={() => isCharacterAvailable(character) && onCharacterSelect(character)}
            draggable={mode === 'freedom' && isCharacterAvailable(character)}
            onDragStart={mode === 'freedom' ? (e) => onDragStart(e, character) : undefined}
          >
            {(() => {
              // If the image is still a placeholder, attempt to derive the official Smite icon URL
              const isPlaceholder = character.image.includes('placeholder');
              const slug = character.name
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '') // remove punctuation
                .trim()
                .replace(/\s+/g, '-');
              const derivedUrl = `https://webcdn.hirezstudios.com/smite/god-icons/${slug}.jpg`;
              return <img src={isPlaceholder ? derivedUrl : character.image} alt={character.name} />;
            })()}
            <div className="character-info">
              <div className="character-name">{character.name}</div>
              <div className={`character-role role-${character.role.toLowerCase()}`}>{character.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterGrid; 