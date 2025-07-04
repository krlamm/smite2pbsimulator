export interface Character {
  id: number;
  name: string;
  image: string;
  roles: string[];
}

export interface TeamState {
  A: Character[];
  B: Character[];
} 