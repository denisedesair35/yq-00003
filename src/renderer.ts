import type { GameState, CharacterStats, ChosenOne, TerritoryStats, InventoryItem, LogEntry, ActionDef } from './types';
import { formatTimestamp } from './logger';
import { getActionsForState } from './actions';

function createProgressBar(current: number, max: number, barClass: string): string {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return `
    <div class="progress-bar">
      <div class="progress-fill ${barClass}" style="width: ${percentage}%"></div>
      <span class="progress-text">${current}/${max}</span>
    </div>
  `;
}

function getElementLabel(element: ChosenOne['element']): string {
  const labels: Record<ChosenOne['element'], string> = {
    fire: '火', ice: '冰', earth: '地', wind: '风', light: '光', shadow: '暗'
  };
  return labels[element];
}

function getElementClass(element: ChosenOne['element']): string {
  return `element-${element}`;
}

function getItemTypeLabel(type: InventoryItem['type']): string {
  const labels: Record<InventoryItem['type'], string> = {
    weapon: '武器', armor: '护甲', consumable: '消耗品', material: '材料', misc: '其他'
  };
  return labels[type];
}

function getItemTypeClass(type: InventoryItem['type']): string {
  return `item-type-${type}`;
}

function getActionAreaLabel(area: ActionDef['area']): string {
  const labels: Record<ActionDef['area'], string> = {
    travel: '出行', management: '管理', military: '军事', diplomacy: '外交'
  };
  return labels[area];
}

function getActionAreaClass(area: ActionDef['area']): string {
  return `action-area-${area}`;
}

function renderCharacter(character: CharacterStats): string {
  return `
    <div class="panel character-panel">
      <h2 class="panel-title">领主</h2>
      <div class="character-header">
        <div class="character-identity">
          <span class="character-name">${character.name}</span>
          <span class="character-title">${character.title}</span>
        </div>
        <span class="character-level">Lv.${character.level}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">生命</span>
        ${createProgressBar(character.health, character.maxHealth, 'health-bar')}
      </div>
      <div class="stat-row">
        <span class="stat-label">体力</span>
        ${createProgressBar(character.stamina, character.maxStamina, 'stamina-bar')}
      </div>
      <div class="stat-row">
        <span class="stat-label">经验</span>
        ${createProgressBar(character.experience, character.maxExperience, 'exp-bar')}
      </div>
      <div class="stat-grid">
        <div class="stat-item">
          <span class="stat-icon">⚔</span>
          <span class="stat-value">${character.attack}</span>
          <span class="stat-name">攻击</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🛡</span>
          <span class="stat-value">${character.defense}</span>
          <span class="stat-name">防御</span>
        </div>
      </div>
    </div>
  `;
}

function renderChosenOne(chosen: ChosenOne): string {
  const statusLabel = chosen.contractStatus === 'active' ? '契约活跃' : chosen.contractStatus === 'dormant' ? '契约休眠' : '契约破碎';
  return `
    <div class="panel chosen-panel">
      <h2 class="panel-title">天选者</h2>
      <div class="chosen-header">
        <div class="chosen-identity">
          <span class="chosen-name">${chosen.name}</span>
          <span class="chosen-title">${chosen.title}</span>
        </div>
        <span class="chosen-element ${getElementClass(chosen.element)}">${getElementLabel(chosen.element)}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">生命</span>
        ${createProgressBar(chosen.health, chosen.maxHealth, 'health-bar')}
      </div>
      <div class="chosen-stats">
        <div class="chosen-stat">
          <span class="chosen-stat-label">等级</span>
          <span class="chosen-stat-value">Lv.${chosen.level}</span>
        </div>
        <div class="chosen-stat">
          <span class="chosen-stat-label">攻击</span>
          <span class="chosen-stat-value">${chosen.attack}</span>
        </div>
        <div class="chosen-stat">
          <span class="chosen-stat-label">防御</span>
          <span class="chosen-stat-value">${chosen.defense}</span>
        </div>
        <div class="chosen-stat">
          <span class="chosen-stat-label">状态</span>
          <span class="chosen-stat-value contract-${chosen.contractStatus}">${statusLabel}</span>
        </div>
      </div>
      <div class="chosen-skill">
        <div class="skill-name">✦ ${chosen.skill}</div>
        <div class="skill-desc">${chosen.skillDescription}</div>
      </div>
      <div class="stat-row">
        <span class="stat-label">羁绊</span>
        ${createProgressBar(chosen.bondLevel, chosen.maxBondLevel, 'bond-bar')}
      </div>
    </div>
  `;
}

function renderTerritory(territory: TerritoryStats): string {
  const r = territory.resources;
  const corruptionColor = r.corruption > 50 ? 'danger' : r.corruption > 25 ? 'warning' : 'normal';
  return `
    <div class="panel territory-panel">
      <h2 class="panel-title">领地</h2>
      <div class="territory-name">${territory.name}</div>
      <div class="territory-stats">
        <div class="territory-stat">
          <span class="territory-icon">💰</span>
          <span class="territory-label">金币</span>
          <span class="territory-value">${r.gold}</span>
        </div>
        <div class="territory-stat">
          <span class="territory-icon">🌾</span>
          <span class="territory-label">粮食</span>
          <span class="territory-value">${r.food}</span>
        </div>
        <div class="territory-stat">
          <span class="territory-icon">🪵</span>
          <span class="territory-label">木材</span>
          <span class="territory-value">${r.wood}</span>
        </div>
        <div class="territory-stat">
          <span class="territory-icon">👥</span>
          <span class="territory-label">人口</span>
          <span class="territory-value">${r.population}</span>
        </div>
        <div class="territory-stat corruption-${corruptionColor}">
          <span class="territory-icon">☣</span>
          <span class="territory-label">腐化</span>
          <span class="territory-value">${r.corruption}</span>
        </div>
        <div class="territory-stat">
          <span class="territory-icon">🏰</span>
          <span class="territory-label">防御</span>
          <span class="territory-value">Lv.${territory.defenseLevel}</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-label">民心</span>
        ${createProgressBar(territory.morale, territory.maxMorale, 'morale-bar')}
      </div>
    </div>
  `;
}

function renderLocationAndPhase(state: GameState): string {
  const locationIcons: Record<string, string> = {
    family_estate: '🏛',
    on_the_road: '🛤',
    howling_fortress: '🏰'
  };
  const locIcon = locationIcons[state.location.id] || '📍';
  return `
    <div class="panel info-panel info-panel-highlight">
      <div class="info-header-row">
        <div class="info-location-block">
          <div class="location-icon-large">${locIcon}</div>
          <div class="location-text-block">
            <h3 class="info-title info-title-location">📍 当前位置</h3>
            <div class="location-name-large">${state.location.name}</div>
            <div class="location-desc">${state.location.description}</div>
          </div>
        </div>
      </div>
      <div class="info-divider info-divider-bold"></div>
      <div class="info-section">
        <h3 class="info-title info-title-phase">🎯 阶段：${state.phase.name}</h3>
        <div class="phase-objective-large">目标：${state.phase.objective}</div>
        <div class="phase-desc">${state.phase.description}</div>
      </div>
      <div class="info-divider"></div>
      <div class="info-section info-turn-row">
        <div class="turn-counter-large">⏱ 回合：${state.turnCount}</div>
      </div>
    </div>
  `;
}

function renderInventory(inventory: InventoryItem[]): string {
  const itemsHtml = inventory.map(item => `
    <div class="inventory-item" title="${item.description}">
      <div class="item-icon ${getItemTypeClass(item.type)}">
        ${getItemTypeLabel(item.type).charAt(0)}
      </div>
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        <span class="item-type ${getItemTypeClass(item.type)}">${getItemTypeLabel(item.type)}</span>
      </div>
      <span class="item-quantity">x${item.quantity}</span>
    </div>
  `).join('');

  return `
    <div class="panel inventory-panel">
      <h2 class="panel-title">背包</h2>
      <div class="inventory-list">
        ${itemsHtml || '<div class="empty-inventory">背包空空如也</div>'}
      </div>
    </div>
  `;
}

function renderActions(_state: GameState): string {
  const actions = getActionsForState();
  const actionsHtml = actions.map(action => `
    <button class="action-btn-large ${getActionAreaClass(action.area)}" data-action="${action.id}">
      <div class="action-btn-header">
        <span class="action-btn-icon">${action.icon}</span>
        <span class="action-btn-name">${action.name}</span>
        <span class="action-btn-tag">${getActionAreaLabel(action.area)}</span>
      </div>
      <div class="action-btn-desc">${action.description}</div>
    </button>
  `).join('');

  return `
    <div class="panel actions-panel">
      <h2 class="panel-title">⚔ 可执行行动</h2>
      <div class="actions-large-list">
        ${actionsHtml || '<div class="empty-inventory">当前无可执行行动</div>'}
      </div>
    </div>
  `;
}

function renderLogEntry(entry: LogEntry): string {
  return `
    <div class="log-entry log-type-${entry.type}">
      <span class="log-time">[${formatTimestamp(entry.timestamp)}]</span>
      <span class="log-message">${entry.message}</span>
    </div>
  `;
}

function renderLogs(logs: LogEntry[]): string {
  const logsHtml = logs.map(renderLogEntry).join('');
  return `
    <div class="panel logs-panel">
      <div class="logs-header">
        <h2 class="panel-title">日志</h2>
        <div class="logs-controls">
          <button class="clear-logs-btn" id="clearLogsBtn">清空</button>
        </div>
      </div>
      <div class="logs-list">
        ${logsHtml || '<div class="empty-logs">暂无日志</div>'}
      </div>
    </div>
  `;
}

export function renderGame(state: GameState): string {
  return `
    <div class="game-container">
      <header class="game-header">
        <div class="header-left">
          <button class="restart-btn" id="restartBtn" title="重新开始">🔄 重新开始</button>
        </div>
        <div class="header-center">
          <h1 class="game-title">呼啸边境</h1>
          <p class="game-subtitle">Howling Border</p>
        </div>
        <div class="header-right">
          <span class="save-indicator" id="saveIndicator">💾 已保存</span>
        </div>
      </header>
      <div class="game-layout">
        <div class="left-column">
          ${renderLocationAndPhase(state)}
          ${renderChosenOne(state.chosenOnes[0])}
          ${renderCharacter(state.character)}
          ${renderTerritory(state.territory)}
        </div>
        <div class="right-column">
          ${renderActions(state)}
          ${renderInventory(state.inventory)}
          ${renderLogs(state.logs)}
        </div>
      </div>
    </div>
  `;
}

export function mountGame(rootElement: HTMLElement, html: string): void {
  rootElement.innerHTML = html;
}
