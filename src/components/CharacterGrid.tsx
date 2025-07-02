import React, { useState } from 'react';
import { Character, TeamState } from '../types';

interface CharacterGridProps {
  characters: Character[];
  onCharacterSelect: (character: Character) => void;
  picks: TeamState;
  bans: TeamState;
}

function CharacterGrid({ characters, onCharacterSelect, picks, bans }: CharacterGridProps) {
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const roles = ['All', 'Assassin', 'Guardian', 'Hunter', 'Mage', 'Warrior'];

  const isCharacterAvailable = (character: Character): boolean => {
    const allPicks = [...picks.A, ...picks.B];
    const allBans = [...bans.A, ...bans.B];
    return !allPicks.some(pick => pick.id === character.id) && 
           !allBans.some(ban => ban.id === character.id);
  };

  const filteredCharacters = characters.filter(character => 
    selectedRole === 'All' || character.role === selectedRole
  );

  return (
    <div className="character-grid-container">
      <div className="role-filters">
        {roles.map(role => (
          <button
            key={role}
            className={`role-filter ${selectedRole === role ? 'active' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </button>
        ))}
      </div>
      <div className="character-grid">
        {filteredCharacters.map(character => (
          <div
            key={character.id}
            className={`character-card ${!isCharacterAvailable(character) ? 'unavailable' : ''}`}
            onClick={() => isCharacterAvailable(character) && onCharacterSelect(character)}
          >
            <img src={character.image} alt={character.name} />
            <div className="character-info">
              <div className="character-name">{character.name}</div>
              <div className="character-role">{character.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CharacterGrid; 