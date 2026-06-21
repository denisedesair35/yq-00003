import type { GameState, PhaseGoals, PhaseGoal, PhaseId, GoalType } from './types';
import { phases } from './constants';

interface GoalConfig {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  targetKey?: string;
  targetValue: number;
  reverse?: boolean;
}

interface PhaseGoalConfig {
  phaseId: PhaseId;
  goalTitle: string;
  goals: GoalConfig[];
  nextPhase?: PhaseId;
  nextLocation?: string;
}

const phaseGoalConfigs: Record<PhaseId, PhaseGoalConfig> = {
  departure: {
    phaseId: 'departure',
    goalTitle: '离开家族领地',
    goals: [
      {
        id: 'departure_food',
        name: '储备粮食',
        description: '准备至少50单位粮食以供旅途所需',
        type: 'resource',
        targetKey: 'food',
        targetValue: 50
      },
      {
        id: 'departure_gold',
        name: '筹备盘缠',
        description: '准备至少30金币作为旅途盘缠',
        type: 'resource',
        targetKey: 'gold',
        targetValue: 30
      },
      {
        id: 'departure_population',
        name: '召集随从',
        description: '召集至少35名愿意追随的仆从与流民',
        type: 'resource',
        targetKey: 'population',
        targetValue: 35
      }
    ],
    nextPhase: 'journey'
  },
  journey: {
    phaseId: 'journey',
    goalTitle: '抵达呼啸要塞',
    goals: [
      {
        id: 'journey_travel',
        name: '跋涉前行',
        description: '执行"前往边境"行动至少2次',
        type: 'action_count',
        targetKey: 'go_to_frontier',
        targetValue: 2
      },
      {
        id: 'journey_supplies',
        name: '维持补给',
        description: '始终保持粮食储备在10以上',
        type: 'resource',
        targetKey: 'food',
        targetValue: 10
      }
    ],
    nextPhase: 'arrival',
    nextLocation: 'howling_fortress'
  },
  arrival: {
    phaseId: 'arrival',
    goalTitle: '初步安置领民',
    goals: [
      {
        id: 'arrival_population',
        name: '安顿流民',
        description: '安置至少50名流民定居',
        type: 'resource',
        targetKey: 'population',
        targetValue: 50
      },
      {
        id: 'arrival_defense',
        name: '修缮城防',
        description: '将要塞防御等级提升至2级',
        type: 'defense',
        targetValue: 2
      },
      {
        id: 'arrival_morale',
        name: '安定民心',
        description: '将领地民心提升至50以上',
        type: 'morale',
        targetValue: 50
      },
      {
        id: 'arrival_corruption',
        name: '清除腐化',
        description: '将领地腐化值降至20以下',
        type: 'resource',
        targetKey: 'corruption',
        targetValue: 20,
        reverse: true
      }
    ],
    nextPhase: 'foundation'
  },
  foundation: {
    phaseId: 'foundation',
    goalTitle: '稳固边境根基',
    goals: [
      {
        id: 'foundation_population',
        name: '繁衍生息',
        description: '领地人口达到100人',
        type: 'resource',
        targetKey: 'population',
        targetValue: 100
      },
      {
        id: 'foundation_defense',
        name: '坚固城防',
        description: '要塞防御等级提升至4级',
        type: 'defense',
        targetValue: 4
      },
      {
        id: 'foundation_morale',
        name: '万众归心',
        description: '领地民心达到80以上',
        type: 'morale',
        targetValue: 80
      }
    ]
  }
};

const actionCounters: Record<string, number> = {};

export function resetActionCounters(): void {
  Object.keys(actionCounters).forEach(key => {
    delete actionCounters[key];
  });
}

export function recordAction(actionId: string): void {
  if (!actionCounters[actionId]) {
    actionCounters[actionId] = 0;
  }
  actionCounters[actionId]++;
}

export function getActionCount(actionId: string): number {
  return actionCounters[actionId] || 0;
}

function getCurrentValueFromState(goal: GoalConfig, state: GameState): number {
  switch (goal.type) {
    case 'resource':
      if (goal.targetKey) {
        const resources = state.territory.resources as unknown as Record<string, number>;
        if (goal.targetKey in resources) {
          return resources[goal.targetKey];
        }
      }
      return 0;
    case 'location':
      return state.location.id === goal.targetKey ? 1 : 0;
    case 'action_count':
      return goal.targetKey ? getActionCount(goal.targetKey) : 0;
    case 'level':
      return state.character.level;
    case 'morale':
      return state.territory.morale;
    case 'defense':
      return state.territory.defenseLevel;
    default:
      return 0;
  }
}

function isGoalCompleted(goal: GoalConfig, currentValue: number): boolean {
  if (goal.reverse) {
    return currentValue <= goal.targetValue;
  }
  return currentValue >= goal.targetValue;
}

export function buildPhaseGoals(phaseId: PhaseId, state: GameState): PhaseGoals {
  const config = phaseGoalConfigs[phaseId];
  if (!config) {
    return { phaseId, goals: [], allCompleted: false };
  }

  const goals: PhaseGoal[] = config.goals.map(g => {
    const currentValue = getCurrentValueFromState(g, state);
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      type: g.type,
      targetKey: g.targetKey,
      targetValue: g.targetValue,
      currentValue,
      completed: isGoalCompleted(g, currentValue)
    };
  });

  const allCompleted = goals.length > 0 && goals.every(g => g.completed);

  return { phaseId, goals, allCompleted };
}

export function getGoalTitleForPhase(phaseId: PhaseId): string {
  return phaseGoalConfigs[phaseId]?.goalTitle || '';
}

export interface PhaseAdvanceResult {
  advanced: boolean;
  newPhaseId?: PhaseId;
  newLocationId?: string;
  goalTitle: string;
  newPhaseName?: string;
  newPhaseObjective?: string;
}

export function checkPhaseCompletion(state: GameState): PhaseAdvanceResult {
  const phaseGoals = buildPhaseGoals(state.phase.id, state);
  const config = phaseGoalConfigs[state.phase.id];
  const goalTitle = config?.goalTitle || '';

  if (phaseGoals.allCompleted && config?.nextPhase) {
    const nextPhaseId = config.nextPhase;
    const nextPhase = phases[nextPhaseId];
    const result: PhaseAdvanceResult = {
      advanced: true,
      newPhaseId: nextPhaseId,
      goalTitle,
      newPhaseName: nextPhase?.name,
      newPhaseObjective: nextPhase?.objective
    };
    if (config.nextLocation) {
      result.newLocationId = config.nextLocation;
    }
    return result;
  }

  return { advanced: false, goalTitle };
}
