export interface CharacterStats {
  name: string;
  title: string;
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

export interface ChosenOne {
  id: string;
  name: string;
  title: string;
  element: 'fire' | 'ice' | 'earth' | 'wind' | 'light' | 'shadow';
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  skill: string;
  skillDescription: string;
  bondLevel: number;
  maxBondLevel: number;
  contractStatus: 'active' | 'dormant' | 'broken';
}

export interface Resources {
  gold: number;
  food: number;
  wood: number;
  population: number;
  corruption: number;
}

export interface TerritoryStats {
  name: string;
  resources: Resources;
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

export type LocationId = 'family_estate' | 'on_the_road' | 'howling_fortress';

export interface LocationInfo {
  id: LocationId;
  name: string;
  description: string;
}

export type PhaseId = 'departure' | 'journey' | 'arrival' | 'foundation';

export interface PhaseInfo {
  id: PhaseId;
  name: string;
  objective: string;
  description: string;
}

export type ActionArea = 'travel' | 'management' | 'military' | 'diplomacy';

export interface ActionDef {
  id: string;
  name: string;
  icon: string;
  area: ActionArea;
  description: string;
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
  chosenOnes: ChosenOne[];
  territory: TerritoryStats;
  inventory: InventoryItem[];
  location: LocationInfo;
  phase: PhaseInfo;
  availableActions: ActionDef[];
  logs: LogEntry[];
  turnCount: number;
}
