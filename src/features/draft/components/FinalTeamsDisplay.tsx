import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { Character } from '../../../types';
import { getGodImageUrl } from '../../../utils/imageUtils';

interface PlayerDisplayProps {
  player: {
    displayName: string;
    pick: string;
  };
  teamColor: string;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({ player, teamColor }) => (
  <div className="text-center">
    <img 
      src={getGodImageUrl({ name: player.pick } as Character)} 
      alt={player.pick} 
      className="w-24 h-24 rounded-full object-cover border-4" 
      style={{ borderColor: teamColor }} 
    />
    <p className="text-lg font-semibold mt-2">{player.pick}</p>
    <p className="text-md text-gray-400">{player.displayName}</p>
  </div>
);

interface TeamDisplayProps {
  teamName: string;
  teamColor: string;
  players: any[]; // Simplified for this example
  bans: string[];
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ teamName, teamColor, players, bans }) => (
  <div className="w-1/2 p-4">
    <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: teamColor }}>{teamName}</h2>
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4 text-center">BANS</h3>
      <div className="flex flex-wrap gap-4 justify-center">
        {bans.length > 0 ? (
          bans.map((banName) => (
            <div key={banName} className="text-center">
              <img 
                src={getGodImageUrl({ name: banName } as Character)} 
                alt={banName} 
                className="w-16 h-16 rounded-md object-cover grayscale" 
              />
              <p className="text-sm">{banName}</p>
            </div>
          ))
        ) : (
          <p>No bans.</p>
        )}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-4 text-center">PICKS</h3>
      <div className="flex flex-wrap gap-6 justify-center">
        {players.length > 0 ? (
          players.map((player) => (
            <PlayerDisplay key={player.uid} player={player} teamColor={teamColor} />
          ))
        ) : (
          <p>No picks.</p>
        )}
      </div>
    </div>
  </div>
);

const FinalTeamsDisplay: React.FC = () => {
  const { initialState } = useDraftContext();

  if (!initialState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading Final Teams Data...
      </div>
    );
  }

  const { teamA, teamB, bans } = initialState;
  const teamAPlayers = Object.entries(teamA.players).map(([uid, player]) => ({ uid, ...(player as object) }));
  const teamBPlayers = Object.entries(teamB.players).map(([uid, player]) => ({ uid, ...(player as object) }));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-bold mb-10">Final Rosters</h1>
      <div className="flex w-full max-w-6xl bg-gray-800 rounded-lg shadow-lg p-8">
        <TeamDisplay
          teamName={teamA.name || 'Team A'}
          teamColor="#1abc9c"
          players={teamAPlayers}
          bans={bans.A}
        />
        <div className="border-l-2 border-gray-600 mx-4"></div>
        <TeamDisplay
          teamName={teamB.name || 'Team B'}
          teamColor="#ff6666"
          players={teamBPlayers}
          bans={bans.B}
        />
      </div>
    </div>
  );
};

export default FinalTeamsDisplay;