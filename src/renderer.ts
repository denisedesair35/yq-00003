import type { GameState, CharacterStats, TerritoryStats, InventoryItem, LogEntry } from './types';
import { formatTimestamp } from './logger';

function createProgressBar(current: number, max: number, barClass: string): string {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  return `
    <div class="progress-bar">
      <div class="progress-fill ${barClass}" style="width: ${percentage}%"></div>
      <span class="progress-text">${current}/${max}</span>
    </div>
  `;
}

function getItemTypeLabel(type: InventoryItem['type']): string {
  const labels: Record<InventoryItem['type'], string> = {
    weapon: '武器',
    armor: '护甲',
    consumable: '消耗品',
    material: '材料',
    misc: '其他'
  };
  return labels[type];
}

function getItemTypeClass(type: InventoryItem['type']): string {
  return `item-type-${type}`;
}

function renderCharacter(character: CharacterStats): string {
  return `
    <div class="panel character-panel">
      <h2 class="panel-title">角色状态</h2>
      <div class="character-header">
        <span class="character-name">${character.name}</span>
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

function renderTerritory(territory: TerritoryStats): string {
  return `
    <div class="panel territory-panel">
      <h2 class="panel-title">领地状态</h2>
      <div class="territory-name">${territory.name}</div>
      <div class="territory-stats">
        <div class="territory-stat">
          <span class="territory-icon">👥</span>
          <span class="territory-label">人口</span>
          <span class="territory-value">${territory.population}</span>
        </div>
        <div class="territory-stat">
          <span class="territory-icon">🌾</span>
          <span class="territory-label">粮食</span>
          <span class="territory-value">${territory.food}</span>
        </div>
        <div class="territory-stat">
          <span class="territory-icon">💰</span>
          <span class="territory-label">金币</span>
          <span class="territory-value">${territory.gold}</span>
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

function renderActions(): string {
  return `
    <div class="panel actions-panel">
      <h2 class="panel-title">行动</h2>
      <div class="action-buttons">
        <button class="action-btn" data-action="explore">🗺 探索</button>
        <button class="action-btn" data-action="hunt">🏹 狩猎</button>
        <button class="action-btn" data-action="gather">⛏ 采集</button>
        <button class="action-btn" data-action="rest">💤 休息</button>
        <button class="action-btn" data-action="train">⚔ 训练</button>
        <button class="action-btn" data-action="build">🏗 建造</button>
        <button class="action-btn" data-action="trade">💱 交易</button>
        <button class="action-btn" data-action="recruit">🎖 招募</button>
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
        <button class="clear-logs-btn" id="clearLogsBtn">清空</button>
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
        <h1 class="game-title">呼啸边境</h1>
        <p class="game-subtitle">Howling Border</p>
      </header>
      <div class="game-layout">
        <div class="left-column">
          ${renderCharacter(state.character)}
          ${renderTerritory(state.territory)}
        </div>
        <div class="right-column">
          ${renderInventory(state.inventory)}
          ${renderActions()}
          ${renderLogs(state.logs)}
        </div>
      </div>
    </div>
  `;
}

export function mountGame(rootElement: HTMLElement, html: string): void {
  rootElement.innerHTML = html;
}
