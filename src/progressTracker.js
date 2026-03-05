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
    pushToCloud(updated);
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

// Fetch cloud progress and merge with local — local wins on conflict to avoid data loss
export async function syncFromCloud() {
  try {
    const res = await fetch('/api/progress');
    if (!res.ok) return null;
    const cloud = await res.json();
    if (!cloud || typeof cloud.gamesPlayed !== 'number') return null;
    const local = getProgress();
    const merged = {
      ...DEFAULT_PROGRESS,
      gamesPlayed: Math.max(local.gamesPlayed, cloud.gamesPlayed),
      totalCorrect: Math.max(local.totalCorrect, cloud.totalCorrect ?? 0),
      totalQuestions: Math.max(local.totalQuestions, cloud.totalQuestions ?? 0),
      highScore: Math.max(local.highScore, cloud.highScore ?? 0),
      currentStreak: 0,
      bestStreak: Math.max(local.bestStreak, cloud.bestStreak ?? 0),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return null;
  }
}

function pushToCloud(progress) {
  fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  }).catch(() => {
    // Cloud sync failed — local progress still saved
  });
}

export function exportProgress() {
  const progress = getProgress();
  const json = JSON.stringify(progress, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = globalThis.document.createElement('a');
  a.href = url;
  a.download = 'madhav-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (typeof data.gamesPlayed !== 'number') return null;
    const merged = { ...DEFAULT_PROGRESS, ...data, currentStreak: 0 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    pushToCloud(merged);
    return merged;
  } catch {
    return null;
  }
}
