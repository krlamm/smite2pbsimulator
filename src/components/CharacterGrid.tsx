import React, { useState } from 'react';
import { Character, TeamState } from '../types';
import { getGodImageUrl } from '../utils/imageUtils';

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
  const filteredCharacters = characters.filter(character => {
    if (selectedRole == null) return false;

    if (selectedRole === 'All') return true;
    for (const role of character.roles) {
      if (role === selectedRole) return true;
    }
    return false;
  });

  // Sort alphabetically when viewing all roles
  const displayCharacters = selectedRole === 'All'
    ? [...filteredCharacters].sort((a, b) => a.name.localeCompare(b.name))
    : filteredCharacters;

  console.log(displayCharacters);
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
        {displayCharacters.map(character => {
          const role = selectedRole ? selectedRole : character.roles[0];
          return (
            <div
              key={character.id}
              className={`character-card role-${role.toLowerCase()} ${!isCharacterAvailable(character) ? 'unavailable' : ''}`}
              onClick={() => isCharacterAvailable(character) && onCharacterSelect(character)}
              draggable={mode === 'freedom' && isCharacterAvailable(character)}
              onDragStart={mode === 'freedom' ? (e) => onDragStart(e, character) : undefined}
            >
              <img src={getGodImageUrl(character)} alt={character.name} />
              <div className="character-info">
                <div className="character-name">{character.name}</div>
                <div className={`character-role role-${role.toLowerCase()}`}>{role}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default CharacterGrid; 