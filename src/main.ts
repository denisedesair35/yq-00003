import './style.css';
import { getState } from './state';
import { renderGame, mountGame } from './renderer';
import { logger } from './logger';

function handleAction(action: string): void {
  const actionNames: Record<string, string> = {
    explore: '探索',
    hunt: '狩猎',
    gather: '采集',
    rest: '休息',
    train: '训练',
    build: '建造',
    trade: '交易',
    recruit: '招募'
  };
  const name = actionNames[action] || action;
  logger.info(`[${name}] 功能开发中，敬请期待...`);
  refreshUI();
}

function handleClearLogs(): void {
  logger.clear();
  refreshUI();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action) {
        handleAction(action);
      }
    });
  });

  const clearLogsBtn = document.getElementById('clearLogsBtn');
  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', handleClearLogs);
  }
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
  refreshUI();
  logger.info('游戏初始化完成。');
  refreshUI();
}

document.addEventListener('DOMContentLoaded', initGame);
