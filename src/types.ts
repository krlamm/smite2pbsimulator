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
 