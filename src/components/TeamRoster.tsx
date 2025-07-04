import React from 'react';

interface TeamRosterProps {
  // Optional props for customization
  customTeams?: boolean;
}

function TeamRoster({ customTeams = false }: TeamRosterProps) {
  // Default team and player data
  const defaultTeamA = {
    name: 'Warriors',
    players: {
      solo: 'SoloOrTroll',
      jungle: 'PANITOM',
      mid: 'Pegon',
      support: 'Genetics',
      carry: 'Netrioid'
    }
  };

  const defaultTeamB = {
    name: 'Dragons',
    players: {
      solo: 'Nika',
      jungle: 'LASBRA',
      mid: 'Dardez',
      support: 'PolarBearMike',
      carry: 'VaporishCoast'
    }
  };

  return (
    <div className="team-roster">
      <div className="roster-header">TEAM ROSTERS</div>
      <div className="roster-content">
        {/* Team A Column */}
        <div className="roster-column team-a">
          {Object.values(defaultTeamA.players).map((player, index) => (
            <div key={`team-a-${index}`} className="player-name" style={{ color: '#00ccff' }}>
              {player}
            </div>
          ))}
        </div>

        {/* Role Column */}
        <div className="roster-column">
          <div className="role-title role-solo">SOLO</div>
          <div className="role-title role-jungle">JUNGLE</div>
          <div className="role-title role-mid">MID</div>
          <div className="role-title role-support">SUPPORT</div>
          <div className="role-title role-carry">CARRY</div>
        </div>

        {/* Team B Column */}
        <div className="roster-column team-b">
          {Object.values(defaultTeamB.players).map((player, index) => (
            <div key={`team-b-${index}`} className="player-name" style={{ color: '#ff3366' }}>
              {player}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamRoster; 