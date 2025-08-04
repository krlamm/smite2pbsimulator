export interface Character {
  id: number;
  name: string;
  image: string;
  roles: string[];
  position?: string;
}

export interface Player {
  uid: string;
  displayName: string;
}

export interface TeamState {
  A: (Character | null)[];
  B: (Character | null)[];
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  friends?: string[];
}

export interface FriendRequest {
  id:string;
  senderId: string;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any; // Firestore timestamp
}

export interface Draft {
  id: string;
  draftName: string;
  status: 'lobby' | 'banning' | 'picking' | 'complete' | 'archived';
  pickOrder: { type: 'ban' | 'pick'; team: 'teamA' | 'teamB'; uid: string }[];
  currentPickIndex: number;
  teamA: {
    name: string;
    captain: string | null;
    players: { [uid: string]: Player };
  };
  teamB: {
    name: string;
    captain: string | null;
    players: { [uid: string]: Player };
  };
  bans: {
    A: string[];
    B: string[];
  };
  picks: {
    [pickOrderIndex: number]: {
      uid: string;
      character: string;
    }
  };
  availableGods: string[];
  createdAt: any; // Firestore timestamp
  hostId: string;
  lastActionTimestamp?: any; // Firestore server timestamp
  leftPlayers?: string[];
}
