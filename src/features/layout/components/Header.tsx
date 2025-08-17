import React from 'react';
import MuteButton from './MuteButton';
import ThemeToggleButton from './ThemeToggleButton';
import ProfileDropdown from './ProfileDropdown';
import { useUserProfile } from '../../auth/hooks/useUserProfile';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUsers } from 'react-icons/fa';
import { useDraftContext } from '../../draft/context/DraftContext';

const Header = () => {
  const { user, userProfile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're in a draft to show Final Teams button
  const isDraftPage = location.pathname.includes('/local') || location.pathname.includes('/draft/');
  
  // Safely try to access draft context only when in a draft
  let draftContext = null;
  try {
    if (isDraftPage) {
      draftContext = useDraftContext();
    }
  } catch (error) {
    // If draft context is not available, draftContext remains null
    console.warn('Draft context not available in header');
  }

  const handleHomeClick = async () => {
    // Check if we're in a multiplayer draft and need to handle leaving
    const isDraftPath = location.pathname.startsWith('/draft/');
    
    if (isDraftPath && user) {
      // For multiplayer drafts, we should handle leaving gracefully
      // This would typically involve the same logic as the old leave button
      // For now, we'll just navigate home
      // TODO: Implement proper draft leaving logic if needed
    }
    
    navigate('/');
  };

  const handleFinalTeamsClick = () => {
    if (!draftContext) {
      navigate('/final-teams');
      return;
    }

    const { initialState, picks, bans, draftId } = draftContext;
    const isOnlineMode = !!draftId;
    
    let draftState;
    if (isOnlineMode && initialState) {
      const teamAPicks: any[] = [];
      const teamBPicks: any[] = [];

      // First, determine which team each pick belongs to
      Object.entries(initialState.picks).forEach(([index, pick]) => {
        const pickOrderEntry = initialState.pickOrder[parseInt(index, 10)];
        if (pickOrderEntry?.team === 'teamA') {
          teamAPicks.push(pick);
        } else if (pickOrderEntry?.team === 'teamB') {
          teamBPicks.push(pick);
        }
      });

      // A lookup for all players in the draft to find their display names
      const allPlayers = { ...initialState.teamA.players, ...initialState.teamB.players };

      // Create a new players object for display purposes
      const finalTeamAPlayers = teamAPicks.reduce((acc, pick, index) => {
        const uid = `final-A-${index}`;
        acc[uid] = {
          uid,
          displayName: allPlayers[pick.uid]?.displayName || 'Unknown Player',
          pick: pick.character,
        };
        return acc;
      }, {});

      const finalTeamBPlayers = teamBPicks.reduce((acc, pick, index) => {
        const uid = `final-B-${index}`;
        acc[uid] = {
          uid,
          displayName: allPlayers[pick.uid]?.displayName || 'Unknown Player',
          pick: pick.character,
        };
        return acc;
      }, {});

      draftState = {
        teamA: {
          name: initialState.teamA?.name || 'Team A',
          players: finalTeamAPlayers,
        },
        teamB: {
          name: initialState.teamB?.name || 'Team B',
          players: finalTeamBPlayers,
        },
        bans: {
          A: initialState.bans?.A || [],
          B: initialState.bans?.B || [],
        },
        status: initialState.status,
        pickOrder: initialState.pickOrder,
        currentPickIndex: initialState.currentPickIndex,
      };
    } else {
      // Local mode
      const teamAPlayers = picks.A.map((pick, index) => ({
        uid: `local-A-${index}`,
        displayName: `Player ${index + 1}`,
        pick: pick ? pick.name : 'N/A',
      }));
      const teamBPlayers = picks.B.map((pick, index) => ({
        uid: `local-B-${index}`,
        displayName: `Player ${index + 6}`,
        pick: pick ? pick.name : 'N/A',
      }));

      draftState = {
        teamA: {
          name: 'ORDER',
          players: teamAPlayers.reduce((acc, player) => ({ ...acc, [player.uid]: player }), {}),
        },
        teamB: {
          name: 'CHAOS',
          players: teamBPlayers.reduce((acc, player) => ({ ...acc, [player.uid]: player }), {}),
        },
        bans: {
          A: bans.A.map(ban => ban ? ban.name : null).filter(Boolean) as string[],
          B: bans.B.map(ban => ban ? ban.name : null).filter(Boolean) as string[],
        },
        status: 'complete',
        pickOrder: [],
        currentPickIndex: 0,
      };
    }
    navigate('/final-teams', { state: { draft: draftState } });
  };

  return (
    <div className="bg-dark-blue flex items-center justify-between px-5 py-3 border-b-2 border-light-blue shadow-lg">
      {/* Left Section - Navigation & Controls */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={handleHomeClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md flex-shrink-0"
          title="Return to Home"
        >
          <FaHome className="text-lg" />
          <span className="hidden sm:inline">HOME</span>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <MuteButton />
          <ThemeToggleButton />
        </div>
      </div>

      {/* Center Section - Title */}
      <div className="flex flex-col items-center justify-center px-4 flex-shrink-0">
        <div className="text-xl lg:text-2xl font-bold tracking-[2px] text-gold text-center text-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          SMITE 2 PICK/BAN SIMULATOR
        </div>
        <div className="text-red-400 text-lg lg:text-xl font-semibold">BETA - NOT FINAL</div>
      </div>

      {/* Right Section - Final Teams & Profile */}
      <div className="flex items-center gap-3 justify-end min-w-0 flex-1">
        {isDraftPage && (
          <button
            onClick={handleFinalTeamsClick}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md flex-shrink-0"
            title="View Final Teams"
          >
            <FaUsers className="text-lg" />
            <span className="hidden sm:inline">FINAL TEAMS</span>
          </button>
        )}
        {user && userProfile ? (
          <ProfileDropdown user={user} userProfile={userProfile} />
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex-shrink-0"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
