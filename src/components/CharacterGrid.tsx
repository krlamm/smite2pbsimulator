import React, { useState } from 'react';
import { Character, TeamState } from '../types';
import { getGodImageUrl } from '../utils/imageUtils';
import RoleSelector from './RoleSelector';

interface CharacterGridProps {
  characters: Character[];
  onCharacterSelect: (character: Character) => void;
  picks: TeamState;
  bans: TeamState;
  mode: 'standard' | 'freedom';
  onDragStart: (e: React.DragEvent, character: Character) => void;
}

const getRoleClasses = (role: string) => {
  switch (role.toLowerCase()) {
    case 'jungle':
      return 'bg-jungle text-black';
    case 'support':
      return 'bg-support text-white';
    case 'carry':
      return 'bg-carry text-white';
    case 'mid':
      return 'bg-mid text-white';
    case 'solo':
      return 'bg-solo text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

const getRoleBorderColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'jungle':
      return 'border-jungle';
    case 'support':
      return 'border-support';
    case 'carry':
      return 'border-carry';
    case 'mid':
      return 'border-mid';
    case 'solo':
      return 'border-solo';
    default:
      return 'border-transparent';
  }
};

const getRoleTextColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'jungle':
      return 'text-jungle';
    case 'support':
      return 'text-support';
    case 'carry':
      return 'text-carry';
    case 'mid':
      return 'text-mid';
    case 'solo':
      return 'text-solo';
    default:
      return 'text-gold';
  }
};

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
    <div className="flex-1 overflow-y-auto p-4 scroll-pt-2.5">
      <div className="flex justify-around mb-5">
        <RoleSelector />
        <div className="flex justify-center gap-2.5 md:flex-wrap">
          {roles.map(role => (
            <button
              key={role}
              // Add 'active' class only if the current role matches selectedRole
              className={`py-2 px-4 rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-500 ${
                selectedRole === role
                  ? `shadow-[0_0_10px_var(--${role.toLowerCase()}-color)] bg-${role.toLowerCase()}-color text-white`
                  : getRoleClasses(role)
              }`}
              // Toggle selectedRole: if clicking active role, set to null (hide); else set to new role (show)
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-4 justify-center">
        {displayCharacters.map(character => {
          // Highlighted change starts here
          const displayedCardRole = selectedRole === 'All' ? character.roles[0] : (selectedRole || character.roles[0]);
          // Highlighted change ends here
          return (
            <div
              key={character.id}
              // Highlighted change starts here
              className={`bg-gray-700 rounded-md overflow-hidden cursor-pointer transition-transform duration-200 flex flex-col border-3 ${getRoleBorderColor(
                displayedCardRole
              )} hover:transform hover:-translate-y-px hover:scale-105 ${
                !isCharacterAvailable(character) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              // Highlighted change ends here
              onClick={() => isCharacterAvailable(character) && onCharacterSelect(character)}
              draggable={mode === 'freedom' && isCharacterAvailable(character)}
              onDragStart={mode === 'freedom' ? (e) => onDragStart(e, character) : undefined}
            >
              <img src={getGodImageUrl(character)} alt={character.name} />
              <div className="p-2 text-center bg-black/80 flex flex-col justify-center gap-0.5 flex-grow min-h-[3.5em]">
                <div className="font-bold text-sm text-white leading-tight overflow-hidden">{character.name}</div>
                {/* Highlighted change starts here */}
                <div className={`text-xs ${getRoleTextColor(displayedCardRole)}`}>{displayedCardRole}</div>
                {/* Highlighted change ends here */}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default CharacterGrid;