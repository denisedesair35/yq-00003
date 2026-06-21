import type { LocationInfo, PhaseInfo, ActionDef } from './types';
import { getState, setState } from './state';
import { logger } from './logger';
import { locationFamilyEstate, locationOnTheRoad, locationHowlingFortress, phaseDeparture, phaseJourney, phaseArrival, phaseFoundation } from './constants';
import { recordAction, buildPhaseGoals, getGoalTitleForPhase } from './goals';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function advancePhase(newPhase: PhaseInfo): void {
  const state = getState();
  if (state.phase.id === newPhase.id) return;
  const oldPhaseName = state.phase.name;
  const newState = {
    ...state,
    phase: newPhase
  };
  newState.phaseGoals = buildPhaseGoals(newPhase.id, newState);
  setState(newState);
  logger.success(`阶段更迭：${oldPhaseName} → ${newPhase.name}`);
  logger.info(`新目标：${newPhase.objective}`);
}

function advanceLocation(newLocation: LocationInfo): void {
  const state = getState();
  setState({
    ...state,
    location: newLocation
  });
}

function updateResources(
  goldDelta: number,
  foodDelta: number,
  woodDelta: number,
  populationDelta: number,
  corruptionDelta: number
): boolean {
  const state = getState();
  const r = state.territory.resources;
  const newGold = r.gold + goldDelta;
  const newFood = r.food + foodDelta;
  const newWood = r.wood + woodDelta;
  const newPopulation = r.population + populationDelta;
  const newCorruption = clamp(r.corruption + corruptionDelta, 0, 100);

  if (newGold < 0 || newFood < 0 || newWood < 0 || newPopulation < 0) {
    return false;
  }

  setState({
    ...state,
    territory: {
      ...state.territory,
      resources: {
        gold: newGold,
        food: newFood,
        wood: newWood,
        population: newPopulation,
        corruption: newCorruption
      }
    },
    turnCount: state.turnCount + 1
  });
  return true;
}

function refreshPhaseGoals(): void {
  const state = getState();
  const phaseGoals = buildPhaseGoals(state.phase.id, state);
  const wasCompleted = state.phaseGoals?.allCompleted;
  
  setState({
    ...state,
    phaseGoals
  });

  if (phaseGoals.allCompleted && !wasCompleted) {
    const goalTitle = getGoalTitleForPhase(state.phase.id);
    logger.success(`阶段目标达成：${goalTitle}！`);
  }
}

export function getActionsForState(): ActionDef[] {
  const { location: { id: locationId } } = getState();

  const actions: ActionDef[] = [
    {
      id: 'go_to_frontier',
      name: '前往边境',
      icon: '🏇',
      area: 'travel',
      description: locationId === 'family_estate'
        ? '启程离开家族领地，前往边境赴任（消耗50粮食、30金币）'
        : locationId === 'on_the_road'
        ? '继续赶路，向呼啸要塞进发（消耗15粮食）'
        : '巡视边境周边，探查敌情，降低腐化（消耗10粮食）'
    },
    {
      id: 'organize_supplies',
      name: '整理物资',
      icon: '📦',
      area: 'management',
      description: locationId === 'family_estate'
        ? '花费金币整理行装，采购旅途所需的粮食和木材（消耗20金币）'
        : locationId === 'on_the_road'
        ? '组织随行人员沿途收集物资（有概率获得粮食和木材）'
        : '派遣商队采购物资，花费金币换取粮食和木材（消耗30金币）'
    },
    {
      id: 'settle_refugees',
      name: '安置流民',
      icon: '👥',
      area: 'management',
      description: locationId === 'family_estate'
        ? '召集愿意追随你的仆从和流民，一同前往边境（消耗20粮食、10金币）'
        : locationId === 'on_the_road'
        ? '沿途接济逃难的流民，邀请他们共赴边境（消耗20粮食）'
        : '将流民安置在要塞周围，增加人口与民心（消耗20粮食、10金币、5木材）'
    }
  ];

  return actions;
}

export function executeAction(actionId: string): void {
  switch (actionId) {
    case 'go_to_frontier':
      doGoToFrontier();
      break;
    case 'organize_supplies':
      doOrganizeSupplies();
      break;
    case 'settle_refugees':
      doSettleRefugees();
      break;
    default:
      logger.warning(`未知行动: ${actionId}`);
      return;
  }
  recordAction(actionId);
  refreshPhaseGoals();
}

function increaseBond(amount: number = 1): void {
  const s = getState();
  if (s.chosenOnes.length === 0) return;
  const chosen = s.chosenOnes[0];
  if (chosen.bondLevel >= chosen.maxBondLevel) return;
  const newBond = clamp(chosen.bondLevel + amount, 0, chosen.maxBondLevel);
  const updatedChosenOnes = s.chosenOnes.map((c, i) =>
    i === 0 ? { ...c, bondLevel: newBond } : c
  );
  setState({
    ...s,
    chosenOnes: updatedChosenOnes
  });
  if (newBond === chosen.maxBondLevel) {
    logger.success(`与${chosen.name}的羁绊已达至深！她向你露出了真心的微笑。`);
  } else {
    logger.info(`与${chosen.name}的羁绊加深。（羁绊: ${newBond}/${chosen.maxBondLevel}）`);
  }
}

function doGoToFrontier(): void {
  const state = getState();
  const locId = state.location.id;

  if (locId === 'family_estate') {
    if (state.territory.resources.food < 50) {
      logger.danger('粮食不足！至少需要50粮食才能启程。请先整理物资。');
      return;
    }
    if (state.territory.resources.gold < 30) {
      logger.danger('金币不足！至少需要30金币作为旅途盘缠。请先整理物资。');
      return;
    }
    updateResources(-30, -50, 0, 0, 0);
    advanceLocation(locationOnTheRoad);
    advancePhase(phaseJourney);
    logger.success('你带着有限的家当，在家族冷眼与嘲讽中离开了领地。');
    logger.info(`${state.chosenOnes[0].name}策马伴你左右，冰霜之力在空气中若隐若现。`);
    logger.warning('前路漫漫，荒野之中危机四伏，务必谨慎前行。');
    return;
  }

  if (locId === 'on_the_road') {
    if (state.territory.resources.food < 15) {
      logger.danger('粮食不足！至少需要15粮食才能继续赶路。');
      return;
    }
    updateResources(0, -15, 0, 0, 0);
    const s2 = getState();
    if (s2.territory.resources.food < 0) {
      const s3 = getState();
      setState({
        ...s3,
        territory: {
          ...s3.territory,
          resources: { ...s3.territory.resources, food: 0 }
        }
      });
      logger.danger('粮食用尽！队伍陷入饥饿困境，众人怨声载道。');
      return;
    }
    const roll = Math.random();
    if (roll < 0.55) {
      advanceLocation(locationHowlingFortress);
      advancePhase(phaseArrival);
      logger.success('经过漫长跋涉，残破的呼啸要塞终于出现在地平线上！');
      logger.info(`${s2.chosenOnes[0].name}抬手凝结寒霜，驱散了空气中弥漫的腐化气息。`);
      logger.warning('要塞城墙坍塌、仓库空置，流民饥寒交迫地聚集在四周。百废待兴。');
    } else if (roll < 0.8) {
      updateResources(0, 0, 0, 0, 5);
      logger.warning(`途中遭遇腐化兽袭击！${s2.chosenOnes[0].name}以凛冬之息将其冻结击碎，但你的心智仍受到侵蚀。腐化值+5`);
    } else {
      logger.info('一路平安无事，队伍在荒野小径上稳步前行。消耗了15粮食。');
    }
    return;
  }

  if (locId === 'howling_fortress') {
    if (state.territory.resources.food < 10) {
      logger.danger('粮食不足！巡视领地至少需要10粮食。');
      return;
    }
    updateResources(0, -10, 0, 0, -8);
    const s = getState();
    const newMorale = clamp(s.territory.morale + 4, 0, s.territory.maxMorale);
    const roll = Math.random();
    setState({
      ...s,
      territory: { ...s.territory, morale: newMorale }
    });
    logger.success('巡视边境周边，清除腐化痕迹。腐化值-8，民心+4，消耗10粮食。');
    if (roll < 0.3) {
      const foundGold = 5 + Math.floor(Math.random() * 15);
      const s2 = getState();
      setState({
        ...s2,
        territory: {
          ...s2.territory,
          resources: { ...s2.territory.resources, gold: s2.territory.resources.gold + foundGold }
        }
      });
      logger.info(`在废弃哨站中发现了${foundGold}金币的遗留财物！`);
    }
    const s3 = getState();
    if (s3.territory.resources.corruption <= 0) {
      logger.info('领地内已无明显腐化迹象，民众神色逐渐安定。');
    }
    if (s3.phase.id === 'arrival' && s3.territory.resources.population >= 50 && s3.territory.defenseLevel >= 2) {
      advancePhase(phaseFoundation);
      logger.success('民心安定、人口充实、防御稳固，你在边境正式站稳了脚跟！进入"立基"阶段！');
    }
    return;
  }
}

function doOrganizeSupplies(): void {
  const state = getState();
  const locId = state.location.id;

  if (locId === 'family_estate') {
    if (state.territory.resources.gold < 20) {
      logger.danger('金币不足！至少需要20金币来整理物资。');
      return;
    }
    const foodGain = 45 + Math.floor(Math.random() * 25);
    const woodGain = 25 + Math.floor(Math.random() * 15);
    updateResources(-20, foodGain, woodGain, 0, 0);
    logger.success(`花费20金币采购物资，获得${foodGain}粮食和${woodGain}木材。`);
    logger.info(`${state.chosenOnes[0].name}默默帮你清点辎重，冰霜之力使食物保鲜更久。`);
    return;
  }

  if (locId === 'on_the_road') {
    const roll = Math.random();
    if (roll < 0.7) {
      const foodGain = 20 + Math.floor(Math.random() * 20);
      const woodGain = 10 + Math.floor(Math.random() * 12);
      updateResources(0, foodGain, woodGain, 0, 0);
      logger.success(`组织随行人员沿途采集，获得${foodGain}粮食和${woodGain}木材。`);
      increaseBond(1);
    } else {
      logger.warning('搜寻半日，荒野贫瘠，一无所获。队伍徒耗体力。');
    }
    return;
  }

  if (locId === 'howling_fortress') {
    if (state.territory.resources.gold < 30) {
      logger.danger('金币不足！派遣商队至少需要30金币。');
      return;
    }
    const foodGain = 55 + Math.floor(Math.random() * 30);
    const woodGain = 30 + Math.floor(Math.random() * 20);
    updateResources(-30, foodGain, woodGain, 0, 0);
    logger.success(`派遣商队前往附近城镇采购，获得${foodGain}粮食和${woodGain}木材。`);
    const s = getState();
    if (s.phase.id === 'arrival' && s.territory.resources.population >= 50 && s.territory.defenseLevel >= 2) {
      advancePhase(phaseFoundation);
      logger.success('物资充盈、民心安定，你在边境正式站稳了脚跟！进入"立基"阶段！');
    }
    return;
  }
}

function doSettleRefugees(): void {
  const state = getState();
  const locId = state.location.id;

  if (locId === 'family_estate') {
    if (state.territory.resources.food < 20) {
      logger.danger('粮食不足！召集流民至少需要20粮食。');
      return;
    }
    if (state.territory.resources.gold < 10) {
      logger.danger('金币不足！分发安家费至少需要10金币。');
      return;
    }
    const popGain = 8 + Math.floor(Math.random() * 10);
    updateResources(-10, -20, 0, popGain, 0);
    logger.success(`花费10金币、20粮食，召集了${popGain}名愿意追随你前往边境的仆从与流民。`);
    logger.info(`${state.chosenOnes[0].name}以冰霜之力示警，为队伍筛选出忠诚可靠之人。`);
    increaseBond(1);
    return;
  }

  if (locId === 'on_the_road') {
    if (state.territory.resources.food < 20) {
      logger.danger('粮食不足！接济流民至少需要20粮食。');
      return;
    }
    const popGain = 10 + Math.floor(Math.random() * 12);
    updateResources(0, -20, 0, popGain, 0);
    logger.success(`沿途接济逃难流民，${popGain}人感恩戴德，愿意追随你共赴边境。`);
    const roll = Math.random();
    if (roll < 0.35) {
      const goldGain = 5 + Math.floor(Math.random() * 15);
      const s = getState();
      setState({
        ...s,
        territory: {
          ...s.territory,
          resources: { ...s.territory.resources, gold: s.territory.resources.gold + goldGain }
        }
      });
      logger.info(`流民中一位商人感恩你的善举，赠予${goldGain}金币。`);
    }
    increaseBond(1);
    return;
  }

  if (locId === 'howling_fortress') {
    if (state.territory.resources.food < 20) {
      logger.danger('粮食不足！安置流民至少需要20粮食。');
      return;
    }
    if (state.territory.resources.gold < 10) {
      logger.danger('金币不足！安置费用至少需要10金币。');
      return;
    }
    if (state.territory.resources.wood < 5) {
      logger.danger('木材不足！搭建简易居所至少需要5木材。');
      return;
    }
    const popGain = 15 + Math.floor(Math.random() * 15);
    updateResources(-10, -20, -5, popGain, 0);
    const s = getState();
    const newMorale = clamp(s.territory.morale + 6, 0, s.territory.maxMorale);
    const defenseBoost = Math.random() < 0.4 ? 1 : 0;
    const newDefense = s.territory.defenseLevel + defenseBoost;
    setState({
      ...s,
      territory: { ...s.territory, morale: newMorale, defenseLevel: newDefense }
    });
    logger.success(`花费10金币、20粮食、5木材，正式安置${popGain}名流民于要塞周边。民心+6`);
    if (defenseBoost > 0) {
      logger.info('流民中有退伍老兵，主动协助修缮城防。防御等级+1！');
    }
    increaseBond(1);
    const s2 = getState();
    if (s2.phase.id === 'arrival' && s2.territory.resources.population >= 50 && s2.territory.defenseLevel >= 2) {
      advancePhase(phaseFoundation);
      logger.success('流民归心、城防渐固，你在边境正式站稳了脚跟！进入"立基"阶段！');
    }
    return;
  }
}

export { locationFamilyEstate, locationOnTheRoad, locationHowlingFortress, phaseDeparture, phaseJourney, phaseArrival, phaseFoundation };
