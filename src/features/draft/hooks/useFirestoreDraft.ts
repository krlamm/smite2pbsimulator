import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Character, TeamState, Draft } from '../../../types';
import { gods } from '../../../constants/gods';
import { useAudioContext } from '../../layout/context/AudioContext';

interface UseDraftProps {
  initialState: Draft | null;
  draftId?: string;
  currentUser?: any;
}

export const useFirestoreDraft = ({ initialState, draftId, currentUser }: UseDraftProps) => {
  const [characters] = useState<Character[]>(gods);
  const { playAudio } = useAudioContext();
  const prevInitialStateRef = useRef(initialState);

  const [phase, setPhase] = useState<'lobby' | 'banning' | 'picking' | 'complete'>(initialState?.status || 'lobby');
  const [bans, setBans] = useState<TeamState>({ A: [], B: [] });
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!initialState || !currentUser) return;
  
    setPhase(initialState.status);
  
    const teamABans = initialState.bans?.A || [];
    const teamBBans = initialState.bans?.B || [];
    const mapNamesToCharacters = (names: string[]): (Character | null)[] => {
      return names.map(name => gods.find(g => g.name === name) || null);
    };
    setBans({ A: mapNamesToCharacters(teamABans), B: mapNamesToCharacters(teamBBans) });
  
    const { pickOrder, currentPickIndex, status, picks, teamA, teamB } = initialState;
  
    if ((status === 'banning' || status === 'picking') && currentPickIndex < pickOrder.length) {
      const currentTurnInfo = pickOrder[currentPickIndex];
      const currentTeam = currentTurnInfo.team;
      const currentTeamData = currentTeam === 'teamA' ? teamA : teamB;
      const isCaptain = currentTeamData.captain === currentUser.uid;
  
      let consecutivePicks = 0;
      if (status === 'picking') {
        for (let i = currentPickIndex; i < pickOrder.length; i++) {
          if (pickOrder[i].team === currentTeam && pickOrder[i].type === 'pick') {
            consecutivePicks++;
          } else {
            break;
          }
        }
      }
  
      if (consecutivePicks > 1) {
        const teamPlayers = initialState[currentTeam].players;
        const isMyTeam = Object.keys(teamPlayers).includes(currentUser.uid);
        
        let myTurnToPick = false;
        // If user is captain, they can pick as long as there's an empty slot in the window.
        if (isCaptain) {
            for (let i = 0; i < consecutivePicks; i++) {
                const pickIndex = currentPickIndex + i;
                if (!picks[pickIndex]) {
                    myTurnToPick = true;
                    break;
                }
            }
        } else { // Otherwise, check if any of the user's assigned picks are available
            for (let i = 0; i < consecutivePicks; i++) {
              const pickIndex = currentPickIndex + i;
              if (pickOrder[pickIndex]?.uid === currentUser.uid && !picks[pickIndex]) {
                myTurnToPick = true;
                break;
              }
            }
        }
        setIsMyTurn(isMyTeam && myTurnToPick);

      } else {
        const currentPlayerTurn = pickOrder[currentPickIndex];
        const isMyDesignatedTurn = currentUser?.uid === currentPlayerTurn.uid;
        setIsMyTurn(isMyDesignatedTurn || isCaptain);
      }
    } else {
      setIsMyTurn(false);
    }
  
    prevInitialStateRef.current = initialState;
  }, [initialState, currentUser]);

  const handleCharacterSelect = async (character: Character) => {
    if (!draftId || !currentUser) return;

    const draftDocRef = doc(db, 'drafts', draftId);
    playAudio(character.name);

    try {
      await runTransaction(db, async (transaction) => {
        const draftDoc = await transaction.get(draftDocRef);
        if (!draftDoc.exists()) {
          throw new Error("Draft document does not exist!");
        }

        const draftData = draftDoc.data() as Draft;
        const { status, pickOrder, currentPickIndex, bans, picks, teamA, teamB } = draftData;

        // --- Verify Turn and Character Availability ---
        let myTurn = false;
        let userPickIndex = -1;
        
        const currentTurnInfo = pickOrder[currentPickIndex];
        if (!currentTurnInfo) return; 

        const currentTeamName = currentTurnInfo.team;
        const currentTeamInfo = currentTeamName === 'teamA' ? teamA : teamB;
        const isCaptain = currentTeamInfo.captain === currentUser.uid;

        if (status === 'banning') {
          myTurn = pickOrder[currentPickIndex].uid === currentUser.uid || isCaptain;
          userPickIndex = currentPickIndex;
        } else if (status === 'picking') {
          const currentTeam = pickOrder[currentPickIndex].team;
          let consecutivePicks = 0;
          for (let i = currentPickIndex; i < pickOrder.length; i++) {
            if (pickOrder[i].team === currentTeam && pickOrder[i].type === 'pick') {
              consecutivePicks++;
            } else {
              break;
            }
          }

          if (consecutivePicks > 0) {
            // Captain can pick for any empty slot in the window
            if (isCaptain) {
              for (let i = 0; i < consecutivePicks; i++) {
                const pickIndex = currentPickIndex + i;
                if (!picks[pickIndex]) {
                  myTurn = true;
                  userPickIndex = pickIndex;
                  break;
                }
              }
            } else { // Player can only pick for their assigned, empty slot
              for (let i = 0; i < consecutivePicks; i++) {
                const pickIndex = currentPickIndex + i;
                if (pickOrder[pickIndex]?.uid === currentUser.uid && !picks[pickIndex]) {
                  myTurn = true;
                  userPickIndex = pickIndex;
                  break;
                }
              }
            }
          } else {
            // Fallback for single picks
            if (pickOrder[currentPickIndex].uid === currentUser.uid || isCaptain) {
              myTurn = true;
              userPickIndex = currentPickIndex;
            }
          }
        }

        if (!myTurn) {
          console.warn("Not your turn or you have already picked.");
          return;
        }

        const allBans = [...(bans?.A || []), ...(bans?.B || [])];
        const allPicks = Object.values(picks || {}).map(p => p.character);
        if (allBans.includes(character.name) || allPicks.includes(character.name)) {
          console.warn("Character already taken.");
          return;
        }

        // --- Prepare Updates ---
        const updates: any = {};

        if (status === 'banning') {
          const teamKey = pickOrder[currentPickIndex].team.slice(-1);
          const currentBans = bans[teamKey] || [];
          updates[`bans.${teamKey}`] = [...currentBans, character.name];
          updates.currentPickIndex = currentPickIndex + 1;
          if (pickOrder[updates.currentPickIndex]?.type === 'pick') {
            updates.status = 'picking';
          }
        } else if (status === 'picking') {
          const assignedUid = pickOrder[userPickIndex].uid;
          updates[`picks.${userPickIndex}`] = { uid: assignedUid, character: character.name };
          
          const newPicks = { ...picks, [userPickIndex]: { uid: assignedUid, character: character.name } };
          
          const currentTeam = pickOrder[currentPickIndex].team;
          let consecutivePicks = 0;
          for (let i = currentPickIndex; i < pickOrder.length; i++) {
            if (pickOrder[i].team === currentTeam && pickOrder[i].type === 'pick') {
              consecutivePicks++;
            } else {
              break;
            }
          }
          
          // Correctly count filled picks within the entire window
          let picksInWindow = 0;
          for (let i = 0; i < consecutivePicks; i++) {
            if (newPicks[currentPickIndex + i]) {
              picksInWindow++;
            }
          }

          if (picksInWindow === consecutivePicks) {
            const newPickIndex = currentPickIndex + consecutivePicks;
            updates.currentPickIndex = newPickIndex;
            if (newPickIndex >= pickOrder.length) {
              updates.status = 'complete';
            }
          }
        }

        // --- Commit Transaction ---
        if (Object.keys(updates).length > 0) {
          transaction.update(draftDocRef, updates);
        }
      });
    } catch (e) {
      console.error("Draft transaction failed: ", e);
    }
  };

  const handleReset = async () => {
    if (!draftId) return;
    const draftDocRef = doc(db, 'drafts', draftId);
    await updateDoc(draftDocRef, {
      status: 'lobby',
      pickOrder: [],
      currentPickIndex: 0,
      teamA: { name: 'Team A', captain: null, players: {} },
      teamB: { name: 'Team B', captain: null, players: {} },
      bans: { A: [], B: [] },
      picks: {},
      availableGods: gods.map(g => g.name),
      lastActionTimestamp: null,
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
    mode: 'standard',
    characters,
    phase,
    picks: { A: [], B: [] }, 
    bans,
    isMyTurn,
    handleCharacterSelect,
    handleReset,
    handleLeave,
    handleDragStart: () => {},
    handleDragOver: () => {},
    handleDragLeave: () => {},
    handleDrop: () => {},
    handleStandardDrop: () => {},
    handleUndo: () => {},
    handleClear: () => {},
  };
};