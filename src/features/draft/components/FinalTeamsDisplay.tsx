import React from 'react';
import { useDraftContext } from '../../draft/context/DraftContext';
import { God } from '../../../types';

interface TeamDisplayProps {
  teamName: string;
  teamColor: string;
  picks: God[];
  bans: God[];
}

const TeamDisplay: React.FC<TeamDisplayProps> = ({ teamName, teamColor, picks, bans }) => (
  <div className="w-1/2 p-4">
    <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: teamColor }}>{teamName}</h2>
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Bans:</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {bans.length > 0 ? (
          bans.map((god) => (
            <div key={god.name} className="text-center">
              <img src={god.image} alt={god.name} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: teamColor }} />
              <p className="text-sm">{god.name}</p>
            </div>
          ))
        ) : (
          <p>No bans.</p>
        )}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-2">Picks:</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {picks.length > 0 ? (
          picks.map((god) => (
            <div key={god.name} className="text-center">
              <img src={god.image} alt={god.name} className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: teamColor }} />
              <p className="text-sm">{god.name}</p>
            </div>
          ))
        ) : (
          <p>No picks.</p>
        )}
      </div>
    </div>
  </div>
);

const FinalTeamsDisplay: React.FC = () => {
  const { picks, bans, teamAName, teamBName, teamAColor, teamBColor } = useDraftContext();

  console.log("FinalTeamsDisplay - Picks:", picks);
  console.log("FinalTeamsDisplay - Bans:", bans);
  console.log("FinalTeamsDisplay - Team A Name:", teamAName);
  console.log("FinalTeamsDisplay - Team B Name:", teamBName);
  console.log("FinalTeamsDisplay - Team A Color:", teamAColor);
  console.log("FinalTeamsDisplay - Team B Color:", teamBColor);

  if (!picks || !bans) {
    console.log("Picks or Bans are not available in context. Showing loading message.");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading Final Teams Data...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Final Teams</h1>
      <div className="flex w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
        <TeamDisplay
          teamName={teamAName}
          teamColor={teamAColor}
          picks={picks.A.map(p => p && p.character ? p.character as God : null).filter(Boolean)}
          bans={bans.A.map(b => b && b.character ? b.character as God : null).filter(Boolean)}
        />
        <TeamDisplay
          teamName={teamBName}
          teamColor={teamBColor}
          picks={picks.B.map(p => p && p.character ? p.character as God : null).filter(Boolean)}
          bans={bans.B.map(b => b && b.character ? b.character as God : null).filter(Boolean)}
        />
      </div>
    </div>
  );
};

export default FinalTeamsDisplay;