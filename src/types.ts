export interface Character {
  id: number;
  name: string;
  image: string;
  role: string;
}

export interface TeamState {
  A: Character[];
  B: Character[];
} 