import type { CharacterStats, ChosenOne, TerritoryStats, InventoryItem, LogEntry, GameState, LocationInfo, PhaseInfo, ActionDef } from './types';
import { locationFamilyEstate, phaseDeparture } from './actions';

const initialCharacter: CharacterStats = {
  name: '艾德里安·冯·灰烬',
  title: '流放贵族',
  level: 1,
  health: 100,
  maxHealth: 100,
  stamina: 80,
  maxStamina: 80,
  attack: 12,
  defense: 8,
  experience: 0,
  maxExperience: 100
};

const initialChosenOne: ChosenOne = {
  id: 'chosen-1',
  name: '薇拉·霜吟',
  title: '冰霜守望者',
  element: 'ice',
  level: 3,
  health: 150,
  maxHealth: 150,
  attack: 28,
  defense: 15,
  skill: '凛冬之息',
  skillDescription: '召唤刺骨寒风，冻结前方一切敌人',
  bondLevel: 1,
  maxBondLevel: 5,
  contractStatus: 'active'
};

const initialTerritory: TerritoryStats = {
  name: '呼啸要塞',
  resources: {
    gold: 120,
    food: 80,
    wood: 40,
    population: 30,
    corruption: 15
  },
  morale: 40,
  maxMorale: 100,
  defenseLevel: 1
};

const initialInventory: InventoryItem[] = [
  { id: 'item-1', name: '家族铁剑', quantity: 1, description: '刻有家族纹章的铁剑，是你身份的证明', type: 'weapon' },
  { id: 'item-2', name: '旧皮甲', quantity: 1, description: '磨损的皮革护甲，聊胜于无', type: 'armor' },
  { id: 'item-3', name: '治疗药水', quantity: 3, description: '恢复50点生命值', type: 'consumable' },
  { id: 'item-4', name: '契约水晶', quantity: 1, description: '与天选者缔结契约的核心媒介', type: 'misc' }
];

const initialLocation: LocationInfo = locationFamilyEstate;

const initialPhase: PhaseInfo = phaseDeparture;

const initialActions: ActionDef[] = [];

const initialLogs: LogEntry[] = [
  {
    id: 'log-init-1',
    timestamp: Date.now() - 300000,
    message: '你是艾德里安·冯·灰烬——被家族排挤的年轻贵族，被迫前往边境担任领主。',
    type: 'info'
  },
  {
    id: 'log-init-2',
    timestamp: Date.now() - 240000,
    message: '与你同行的，是已缔结契约的天选者——薇拉·霜吟。她的冰霜之力将是你最可靠的倚仗。',
    type: 'info'
  },
  {
    id: 'log-init-3',
    timestamp: Date.now() - 180000,
    message: '家族只给了你微薄的物资和一块荒凉的边境封地。一切都要靠你自己了。',
    type: 'warning'
  },
  {
    id: 'log-init-4',
    timestamp: Date.now() - 60000,
    message: '整理好行装，准备前往边境吧。前路漫漫，险阻重重。',
    type: 'info'
  }
];

export const initialGameState: GameState = {
  character: initialCharacter,
  chosenOnes: [initialChosenOne],
  territory: initialTerritory,
  inventory: initialInventory,
  location: initialLocation,
  phase: initialPhase,
  availableActions: initialActions,
  logs: initialLogs,
  turnCount: 0
};

let currentState: GameState = JSON.parse(JSON.stringify(initialGameState));

export function getState(): GameState {
  return currentState;
}

export function setState(newState: GameState): void {
  currentState = newState;
}

export function resetState(): void {
  currentState = JSON.parse(JSON.stringify(initialGameState));
}

export function loadState(saved: GameState): void {
  currentState = saved;
}
