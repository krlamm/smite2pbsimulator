export interface Character {
  id: number;
  name: string;
  image: string;
  roles: string[];
  position?: string;
}

export interface TeamState {
  A: Character[];
  B: Character[];
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  friends?: string[];
}

export interface FriendRequest {
  id: string;
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
    blueTeamUser: { uid: string; name: string; };
    redTeamUser: { uid: string; name: string; } | null;
    mode: 'standard' | 'freedom';
    phase: string;
    activeTeam: 'blue' | 'red';
    blueBans: string[];
    redBans: string[];
    bluePicks: string[];
    redPicks: string[];
    availableGods: string[];
    timer: number;
    teamAName: string;
    teamBName: string;
    createdAt: any; // Firestore timestamp
}
 