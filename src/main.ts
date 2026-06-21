import './style.css';
import { getState, resetState, loadState } from './state';
import { renderGame, mountGame } from './renderer';
import { logger } from './logger';
import { executeAction } from './actions';
import { saveGame, loadGame, clearSave, hasSave } from './storage';

let actionLock = false;

function flashSaveIndicator(): void {
  const indicator = document.getElementById('saveIndicator');
  if (!indicator) return;
  indicator.classList.add('save-flash');
  setTimeout(() => indicator.classList.remove('save-flash'), 1200);
}

function persistState(): void {
  saveGame(getState());
  flashSaveIndicator();
}

function handleAction(actionId: string): void {
  if (actionLock) return;
  actionLock = true;
  executeAction(actionId);
  persistState();
  refreshUI();
  setTimeout(() => { actionLock = false; }, 400);
}

function handleClearLogs(): void {
  logger.clear();
  persistState();
  refreshUI();
}

function handleRestart(): void {
  if (!confirm('确定要重新开始吗？当前所有进度将会丢失！')) return;
  clearSave();
  resetState();
  persistState();
  refreshUI();
}

function bindEvents(): void {
  const app = document.getElementById('app');
  if (!app || app.dataset.delegated === 'true') return;

  app.addEventListener('click', (e) => {
    if (actionLock) return;

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
      return;
    }
  }

  refreshUI();
  persistState();
}

window.addEventListener('beforeunload', () => {
  saveGame(getState());
});

document.addEventListener('DOMContentLoaded', initGame);
