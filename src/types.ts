export interface CharacterStats {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  attack: number;
  defense: number;
  experience: number;
  maxExperience: number;
}

export interface TerritoryStats {
  name: string;
  population: number;
  food: number;
  gold: number;
  morale: number;
  maxMorale: number;
  defenseLevel: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'misc';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export type LogType = 'info' | 'success' | 'warning' | 'danger';

export interface GameState {
  character: CharacterStats;
  territory: TerritoryStats;
  inventory: InventoryItem[];
  logs: LogEntry[];
}
