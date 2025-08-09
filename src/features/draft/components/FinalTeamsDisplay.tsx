import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { Character } from '../../../types';
import { getGodImageUrl } from '../../../utils/imageUtils';

interface PlayerDisplayProps {
  player: {
    displayName: string;
    pick: Character;
  };
  teamColor: string;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ player, teamColor }) => (
  <div className="text-center">
    <img 
      src={getGodImageUrl(player.pick)} 
      alt={player.pick.name} 
      className="w-32 h-32 rounded-full object-cover border-8" 
      style={{ borderColor: teamColor }} 
    />
    <p className="text-xl font-semibold mt-3">{player.pick.name}</p>
    <p className="text-lg text-gray-400">{player.displayName}</p>
  </div>
);

interface TeamDisplayProps {
  teamName: string;
  teamColor: string;
  players: any[]; // Simplified for this example
  bans: Character[];
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ teamName, teamColor, players, bans }) => (
  <div className="w-full p-4">
    <h2 className="text-4xl font-bold mb-6 text-center" style={{ color: teamColor }}>{teamName}</h2>
    <div className="mb-8">
      <h3 className="text-2xl font-semibold mb-4 text-center">BANS</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {bans.length > 0 ? (
          bans.map((ban) => (
            <div key={ban.name} className="text-center">
              <img 
                src={getGodImageUrl(ban)} 
                alt={ban.name} 
                className="w-20 h-20 rounded-md object-cover grayscale" 
              />
              <p className="text-md">{ban.name}</p>
            </div>
          ))
        ) : (
          <p>No bans.</p>
        )}
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-semibold mb-4 text-center">PICKS</h3>
      {players.length > 0 ? (
        <>
          <div className="flex justify-center gap-4 mb-4">
            {players.slice(0, 3).map((player) => (
              <PlayerDisplay key={player.uid} player={player} teamColor={teamColor} />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            {players.slice(3, 5).map((player) => (
              <PlayerDisplay key={player.uid} player={player} teamColor={teamColor} />
            ))}
          </div>
        </>
      ) : (
        <p>No picks.</p>
      )}
    </div>
  </div>
);

const FinalTeamsDisplay: React.FC = () => {
  const { initialState, characters } = useDraftContext();

  if (!initialState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Loading Final Teams Data...
      </div>
    );
  }

  const { teamA, teamB, bans } = initialState;
  if (!teamA || !teamB || !bans) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        Error: Incomplete draft data.
      </div>
    );
  }
  const findCharacter = (name: string) => characters.find(c => c.name === name);

  const teamAPlayers = Object.entries(teamA.players).map(([uid, player]: [string, any]) => ({
    uid,
    displayName: player.displayName,
    pick: findCharacter(player.pick),
  })).filter(p => p.pick); // Filter out players with no pick

  const teamBPlayers = Object.entries(teamB.players).map(([uid, player]: [string, any]) => ({
    uid,
    displayName: player.displayName,
    pick: findCharacter(player.pick),
  })).filter(p => p.pick);

  const teamABans = bans.A.map(findCharacter).filter(Boolean) as Character[];
  const teamBBans = bans.B.map(findCharacter).filter(Boolean) as Character[];

  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden bg-gray-900 text-white p-4">
      <h1 className="text-6xl font-bold mb-8">Final Rosters</h1>
      <div className="flex w-full max-w-screen-2xl bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="w-1/2 pr-3">
          <TeamDisplay
            teamName={teamA.name || 'Team A'}
            teamColor="#1abc9c"
            players={teamAPlayers}
            bans={teamABans}
          />
        </div>
        <div className="border-l-4 border-gray-600 mx-3"></div>
        <div className="w-1/2 pl-3">
          <TeamDisplay
            teamName={teamB.name || 'Team B'}
            teamColor="#ff6666"
            players={teamBPlayers}
            bans={teamBBans}
          />
        </div>
      </div>
    </div>
  );
};

export default FinalTeamsDisplay;
