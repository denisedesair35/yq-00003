import type { LogEntry, LogType } from './types';
import { getState, setState } from './state';

let logCounter = 1000;

function generateLogId(): string {
  return `log-${Date.now()}-${logCounter++}`;
}

export function addLog(message: string, type: LogType = 'info'): LogEntry {
  const state = getState();
  const newEntry: LogEntry = {
    id: generateLogId(),
    timestamp: Date.now(),
    message,
    type
  };

  const newLogs = [newEntry, ...state.logs].slice(0, 100);
  setState({
    ...state,
    logs: newLogs
  });

  return newEntry;
}

export function clearLogs(): void {
  const state = getState();
  setState({
    ...state,
    logs: []
  });
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export const logger = {
  info: (message: string) => addLog(message, 'info'),
  success: (message: string) => addLog(message, 'success'),
  warning: (message: string) => addLog(message, 'warning'),
  danger: (message: string) => addLog(message, 'danger'),
  clear: clearLogs
};
