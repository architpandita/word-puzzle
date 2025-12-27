// LocalStorage utilities for game state management

const STORAGE_KEYS = {
  COMPLETED_SENTENCES: 'cts_completed_sentences',
  GAME_STATE: 'cts_game_state',
  THEME: 'cts_theme'
};

// Completed sentences management
export const getCompletedSentences = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_SENTENCES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading completed sentences:', e);
    return [];
  }
};

export const addCompletedSentence = (sentence) => {
  try {
    const completed = getCompletedSentences();
    if (!completed.includes(sentence)) {
      completed.push(sentence);
      localStorage.setItem(STORAGE_KEYS.COMPLETED_SENTENCES, JSON.stringify(completed));
    }
  } catch (e) {
    console.error('Error saving completed sentence:', e);
  }
};

export const isSentenceCompleted = (sentence) => {
  const completed = getCompletedSentences();
  return completed.includes(sentence);
};

export const clearCompletedSentences = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.COMPLETED_SENTENCES);
  } catch (e) {
    console.error('Error clearing completed sentences:', e);
  }
};

// Game state management
export const saveGameState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving game state:', e);
  }
};

export const getGameState = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading game state:', e);
    return null;
  }
};

export const clearGameState = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (e) {
    console.error('Error clearing game state:', e);
  }
};

// Theme management
export const getTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  } catch (e) {
    return 'light';
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Error saving theme:', e);
  }
};
