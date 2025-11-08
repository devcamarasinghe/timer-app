import type { Timer } from '../types/timer';

const STORAGE_KEY = 'timers';

export const saveTimers = (timers: Timer[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  } catch (error) {
    console.error('Failed to save timers:', error);
  }
};

export const loadTimers = (): Timer[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load timers:', error);
    return [];
  }
};