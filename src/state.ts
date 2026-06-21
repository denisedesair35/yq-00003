import type { CharacterStats, TerritoryStats, InventoryItem, LogEntry, GameState } from './types';

const initialCharacter: CharacterStats = {
  name: '边境领主',
  level: 1,
  health: 100,
  maxHealth: 100,
  stamina: 80,
  maxStamina: 80,
  attack: 15,
  defense: 10,
  experience: 0,
  maxExperience: 100
};

const initialTerritory: TerritoryStats = {
  name: '呼啸要塞',
  population: 120,
  food: 500,
  gold: 200,
  morale: 75,
  maxMorale: 100,
  defenseLevel: 1
};

const initialInventory: InventoryItem[] = [
  { id: 'item-1', name: '铁剑', quantity: 1, description: '一把锋利的铁剑，适合边境战斗', type: 'weapon' },
  { id: 'item-2', name: '皮甲', quantity: 1, description: '轻便的皮革护甲', type: 'armor' },
  { id: 'item-3', name: '治疗药水', quantity: 5, description: '恢复50点生命值', type: 'consumable' },
  { id: 'item-4', name: '铁矿石', quantity: 20, description: '可用于锻造武器和护甲', type: 'material' },
  { id: 'item-5', name: '木材', quantity: 50, description: '建造和修缮所需的木材', type: 'material' },
  { id: 'item-6', name: '面包', quantity: 30, description: '士兵们的日常口粮', type: 'consumable' }
];

const initialLogs: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: Date.now() - 300000,
    message: '欢迎来到呼啸边境！你是这片土地的新任领主。',
    type: 'info'
  },
  {
    id: 'log-2',
    timestamp: Date.now() - 240000,
    message: '侦察兵报告：北方山脉发现兽人活动踪迹。',
    type: 'warning'
  },
  {
    id: 'log-3',
    timestamp: Date.now() - 180000,
    message: '丰收季节来临，粮仓储备充足。',
    type: 'success'
  },
  {
    id: 'log-4',
    timestamp: Date.now() - 60000,
    message: '城墙修缮工作已准备就绪，等待你的指令。',
    type: 'info'
  }
];

export const initialGameState: GameState = {
  character: initialCharacter,
  territory: initialTerritory,
  inventory: initialInventory,
  logs: initialLogs
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
