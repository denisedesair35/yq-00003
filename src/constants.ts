import type { LocationInfo, PhaseInfo, LocationId, PhaseId } from './types';

export const locationFamilyEstate: LocationInfo = {
  id: 'family_estate',
  name: '家族领地',
  description: '繁华的家族核心领地，你在这里不受欢迎。'
};

export const locationOnTheRoad: LocationInfo = {
  id: 'on_the_road',
  name: '赴任途中',
  description: '前往边境的漫长旅途，荒野与危险并存。'
};

export const locationHowlingFortress: LocationInfo = {
  id: 'howling_fortress',
  name: '呼啸要塞',
  description: '残破的边境要塞，你的新领地。百废待兴。'
};

export const locations: Record<LocationId, LocationInfo> = {
  family_estate: locationFamilyEstate,
  on_the_road: locationOnTheRoad,
  howling_fortress: locationHowlingFortress
};

export const phaseDeparture: PhaseInfo = {
  id: 'departure',
  name: '离乡',
  objective: '整理行装，离开家族领地，踏上赴任之路',
  description: '你被家族排挤，被迫前往边境。在离开之前，你需要做好充分准备。'
};

export const phaseJourney: PhaseInfo = {
  id: 'journey',
  name: '旅途',
  objective: '安全抵达边境要塞',
  description: '前往边境的路途遥远而危险，小心行事。'
};

export const phaseArrival: PhaseInfo = {
  id: 'arrival',
  name: '初临',
  objective: '安定人心，建立基本秩序',
  description: '你抵达了破败的呼啸要塞，这里急需一位合格的领主。'
};

export const phaseFoundation: PhaseInfo = {
  id: 'foundation',
  name: '立基',
  objective: '稳固领地，发展资源，抵御腐化蔓延',
  description: '边境之地危机四伏，唯有夯实根基方能立足。'
};

export const phases: Record<PhaseId, PhaseInfo> = {
  departure: phaseDeparture,
  journey: phaseJourney,
  arrival: phaseArrival,
  foundation: phaseFoundation
};
