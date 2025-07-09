import React, { useState } from 'react';
import { Character } from '../../../types';
import { getGodImageUrl } from '../../../utils/imageUtils';
import { useDraftContext } from '../context/DraftContext';
import { roles } from '../../../constants/roles';

const getRoleClasses = (role: string) => {
  const roleInfo = roles.find(r => r.name === role);
  return roleInfo ? roleInfo.classes : 'bg-gray-600 text-white';
};

const getRoleBorderColor = (role: string) => {
  const roleInfo = roles.find(r => r.name === role);
  return roleInfo ? roleInfo.borderColor : 'border-transparent';
};

const getRoleTextColor = (role: string) => {
  const roleInfo = roles.find(r => r.name === role);
  return roleInfo ? roleInfo.textColor : 'text-gold';
};

function CharacterGrid() {
  const { characters, picks, bans, mode, handleCharacterSelect, handleDragStart } = useDraftContext();
  const [selectedRole, setSelectedRole] = useState<string | null>('All');

  const isCharacterAvailable = (character: Character): boolean => {
    const allPicks = [...picks.A, ...picks.B];
    const allBans = [...bans.A, ...bans.B];
    return !allPicks.some(pick => pick?.id === character.id) &&
      !allBans.some(ban => ban?.id === character.id);
  };

  const filteredCharacters = characters.filter(character => {
    if (selectedRole == null) return false;
    if (selectedRole === 'All') return true;
    return character.roles.includes(selectedRole);
  });

  const displayCharacters = selectedRole === 'All'
    ? [...filteredCharacters].sort((a, b) => a.name.localeCompare(b.name))
    : filteredCharacters;

  return (
    <div className="flex-1 overflow-y-auto p-4 scroll-pt-2.5 scrollbar-custom">
      <div className="flex justify-around mb-5">
        <div className="flex justify-center gap-2.5 md:flex-wrap">
          {roles.map(role => {
            const roleInfo = roles.find(r => r.name === role.name);
            const isActive = selectedRole === role.name;
            return (
              <button
                key={role.name}
                className={`py-2 px-4 rounded-md cursor-pointer transition-all duration-200 border-2 ${
                  isActive
                    ? `${roleInfo?.classes} text-white shadow-[0_0_10px_var(--${role.name.toLowerCase()}-color)]`
                    : `bg-gray-800/50 ${roleInfo?.borderColor} ${roleInfo?.textColor} hover:bg-gray-700/70`
                }`}
                onClick={() => setSelectedRole(selectedRole === role.name ? null : role.name)}
              >
                {role.name}
              </button>
            )
          })}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 p-4 justify-center">
        {displayCharacters.map(character => {
          const displayedCardRole = selectedRole === 'All' ? character.roles[0] : (selectedRole || character.roles[0]);
          return (
            <div
              key={character.id}
              className={`bg-gray-700 rounded-md overflow-hidden cursor-pointer transition-transform duration-200 flex flex-col border-3 ${getRoleBorderColor(
                displayedCardRole
              )} hover:transform hover:-translate-y-px hover:scale-105 ${
                !isCharacterAvailable(character) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => isCharacterAvailable(character) && handleCharacterSelect(character)}
              draggable={mode === 'freedom' && isCharacterAvailable(character)}
              onDragStart={mode === 'freedom' ? (e) => handleDragStart(e, character) : undefined}
            >
              <img src={getGodImageUrl(character)} alt={character.name} />
              <div className="p-2 text-center bg-black/80 flex flex-col justify-center gap-0.5 flex-grow min-h-[3.5em]">
                <div className="font-bold text-sm text-white leading-tight overflow-hidden">{character.name}</div>
                <div className={`text-xs ${getRoleTextColor(displayedCardRole)}`}>{displayedCardRole}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default CharacterGrid;
