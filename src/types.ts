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
  friends?: string[];
}
 