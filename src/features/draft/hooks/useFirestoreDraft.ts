import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Character, TeamState, Draft } from '../../../types';
import { gods } from '../../../constants/gods';
import { useAudioContext } from '../../layout/context/AudioContext';
// ...
interface UseDraftProps {
  initialState: Draft | null;
  draftId?: string;
  currentUser?: any;
}

export const useFirestoreDraft = ({ initialState, draftId, currentUser }: UseDraftProps) => {
  const [characters] = useState<Character[]>(gods);
  const { playAudio } = useAudioContext();
  const prevInitialStateRef = useRef(initialState);

  // Simplified state for the hook, derived from initialState
  const [phase, setPhase] = useState<'lobby' | 'banning' | 'picking' | 'complete'>(initialState?.status || 'lobby');
  const [picks, setPicks] = useState<TeamState>({ A: [], B: [] });
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);

  useEffect(() => {
    if (!initialState || !currentUser) {
      setIsMyTurn(false);
      return;
    }

    setPhase(initialState.status);

    // Derive picks and bans from the new structure for UI compatibility
    const deriveTeamState = (team: 'A' | 'B') => {
      const teamData = initialState[team === 'A' ? 'teamA' : 'teamB'];
      const teamPicks = Object.values(teamData.players).map((p: any) => p.pick).filter(Boolean);
      const teamBans = initialState.bans[team];
      return { picks: teamPicks, bans: teamBans };
    };
    
    const teamAState = deriveTeamState('A');
    const teamBState = deriveTeamState('B');

    const mapNamesToCharacters = (names: string[]): (Character | null)[] => {
      return names.map(name => gods.find(g => g.name === name) || null);
    };

    setPicks({ A: mapNamesToCharacters(teamAState.picks), B: mapNamesToCharacters(teamBState.picks) });
    setBans({ A: mapNamesToCharacters(teamAState.bans), B: mapNamesToCharacters(teamBState.bans) });

    // Determine whose turn it is
    const { pickOrder, currentPickIndex, teamA, teamB } = initialState;
    if (initialState.status === 'banning' || initialState.status === 'picking') {
      if (currentPickIndex < pickOrder.length) {
        const currentPlayerTurn = pickOrder[currentPickIndex];
        setActivePlayer(currentPlayerTurn);

        const isMyDesignatedTurn = currentUser.uid === currentPlayerTurn.uid;
        
        const currentTeamKey = currentPlayerTurn.team; // 'teamA' or 'teamB'
        const captainId = initialState[currentTeamKey].captain;
        const iAmCaptainOfCurrentTeam = currentUser.uid === captainId;

        setIsMyTurn(isMyDesignatedTurn || iAmCaptainOfCurrentTeam);
      } else {
        setIsMyTurn(false);
        setActivePlayer(null);
      }
    } else {
      setIsMyTurn(false);
      setActivePlayer(null);
    }

    // Audio playback logic (simplified for brevity)
    // ...

    prevInitialStateRef.current = initialState;

  }, [initialState, currentUser, playAudio]);

  const handleCharacterSelect = async (character: Character) => {
    if (!isMyTurn || !draftId || !activePlayer) return;

    const draftDocRef = doc(db, 'drafts', draftId);
    const { status, pickOrder, currentPickIndex } = initialState;
    const currentPlayerTurn = pickOrder[currentPickIndex];
    
    const updates: any = {};

    if (status === 'banning') {
      const teamKey = currentPlayerTurn.team; // 'teamA' or 'teamB'
      const banKey = teamKey === 'teamA' ? 'bans.A' : 'bans.B';
      updates[banKey] = [...initialState.bans[teamKey.slice(-1)], character.name];
    } else if (status === 'picking') {
      const teamKey = currentPlayerTurn.team;
      const playerKey = `${teamKey}.players.${currentPlayerTurn.uid}`;
      updates[`${playerKey}.pick`] = character.name;
      updates[`${playerKey}.hasPicked`] = true;
    }

    // Advance to next turn
    const nextPickIndex = currentPickIndex + 1;
    updates.currentPickIndex = nextPickIndex;

    // Check for phase transitions
    const nextAction = pickOrder[nextPickIndex];
    if (status === 'banning' && nextAction && nextAction.type === 'pick') {
      updates.status = 'picking';
    } else if (status === 'picking' && nextPickIndex >= pickOrder.length) {
      updates.status = 'complete';
    }

    await updateDoc(draftDocRef, updates);
  };

  const handleReset = async () => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    // Reset logic needs to be adapted for the new 5v5 model
    await updateDoc(draftDocRef, {
      status: 'lobby',
      pickOrder: [],
      currentPickIndex: 0,
      teamA: { name: 'Team A', captain: null, players: {} },
      teamB: { name: 'Team B', captain: null, players: {} },
      bans: { A: [], B: [] },
      picks: { A: [], B: [] },
      availableGods: gods.map(g => g.name),
    });
  };

  const handleLeave = async () => {
    if (!draftId || !currentUser) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    const draftSnap = await getDoc(draftDocRef);
    if (!draftSnap.exists()) return;
    const draftData = draftSnap.data();

    const updates: any = {};
    if (draftData.teamA.players[currentUser.uid]) {
      delete draftData.teamA.players[currentUser.uid];
      updates['teamA.players'] = draftData.teamA.players;
      if (draftData.teamA.captain === currentUser.uid) {
        updates['teamA.captain'] = null;
      }
    } else if (draftData.teamB.players[currentUser.uid]) {
      delete draftData.teamB.players[currentUser.uid];
      updates['teamB.players'] = draftData.teamB.players;
       if (draftData.teamB.captain === currentUser.uid) {
        updates['teamB.captain'] = null;
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(draftDocRef, updates);
    }
  };

  return {
    // Return what the UI components expect, adapted from the new state
    mode: 'standard', // Or derive from initialState if needed
    characters,
    phase,
    // These might need further adaptation depending on UI needs
    currentTeam: activePlayer ? (activePlayer.team === 'teamA' ? 'A' : 'B') : '',
    picks,
    bans,
    isMyTurn,
    handleCharacterSelect,
    handleReset,
    handleLeave,
    // Deprecated functions for this mode
    handleDragStart: () => {},
    handleDragOver: () => {},
    handleDragLeave: () => {},
    handleDrop: () => {},
    handleStandardDrop: () => {},
    handleUndo: () => {},
    handleClear: () => {},
  };
};
