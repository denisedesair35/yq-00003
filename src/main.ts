import './style.css';
import { getState, resetState, loadState } from './state';
import { renderGame, mountGame } from './renderer';
import { logger } from './logger';
import { executeAction } from './actions';
import { saveGame, loadGame, clearSave, hasSave } from './storage';

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const state = getState();
    saveGame(state);
    flashSaveIndicator();
  }, 300);
}

function flashSaveIndicator(): void {
  const indicator = document.getElementById('saveIndicator');
  if (!indicator) return;
  indicator.classList.add('save-flash');
  setTimeout(() => indicator.classList.remove('save-flash'), 1200);
}

function handleAction(actionId: string): void {
  executeAction(actionId);
  scheduleSave();
  refreshUI();
}

function handleClearLogs(): void {
  logger.clear();
  scheduleSave();
  refreshUI();
}

function handleRestart(): void {
  if (!confirm('确定要重新开始吗？当前进度将会丢失！')) return;
  clearSave();
  resetState();
  logger.info('游戏已重置。你重新站在了家族领地的大门前。');
  refreshUI();
}

function bindEvents(): void {
  const app = document.getElementById('app');
  if (!app || app.dataset.delegated === 'true') return;

  app.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const actionBtn = target.closest<HTMLButtonElement>('.action-btn-large, .action-btn');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action) {
        handleAction(action);
      }
      return;
    }

    if (target.closest<HTMLButtonElement>('#clearLogsBtn')) {
      handleClearLogs();
      return;
    }

    if (target.closest<HTMLButtonElement>('#restartBtn')) {
      handleRestart();
      return;
    }
  });

  app.dataset.delegated = 'true';
}

function refreshUI(): void {
  const state = getState();
  const app = document.getElementById('app');
  if (app) {
    mountGame(app, renderGame(state));
    bindEvents();
  }
}

function initGame(): void {
  const app = document.getElementById('app');
  if (!app) {
    console.error('未找到 #app 根元素');
    return;
  }

  if (hasSave()) {
    const saved = loadGame();
    if (saved) {
      loadState(saved);
      refreshUI();
      logger.info('存档已加载。');
      refreshUI();
      return;
    }
  }

  refreshUI();
  logger.info('游戏初始化完成。');
  refreshUI();
}

document.addEventListener('DOMContentLoaded', initGame);
