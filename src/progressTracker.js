const STORAGE_KEY = "madhav_progress";

const DEFAULT_PROGRESS = {
  gamesPlayed: 0,
  totalCorrect: 0,
  totalQuestions: 0,
  highScore: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export function getProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveGameResult({ coinsEarned, correct, total, bestStreakThisGame }) {
  try {
    const prev = getProgress();
    const updated = {
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      totalCorrect: prev.totalCorrect + correct,
      totalQuestions: prev.totalQuestions + total,
      highScore: Math.max(prev.highScore, coinsEarned),
      currentStreak: 0,
      bestStreak: Math.max(prev.bestStreak, bestStreakThisGame ?? 0),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — progress not persisted
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage unavailable
  }
}
