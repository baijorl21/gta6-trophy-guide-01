// Progress store: earned trophies, per-trophy counters and the spoiler
// setting, persisted in localStorage. Nothing leaves the browser.

const STORAGE_KEY = 'leonida-legend-progress-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: new Set(), counts: {}, spoiler: false };
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return { earned: new Set(), counts: {}, spoiler: false };
  }
}

export function saveProgress(progress) {
  const data = {
    earned: [...progress.earned],
    counts: progress.counts,
    spoiler: progress.spoiler,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function toggleEarned(progress, trophyName) {
  if (progress.earned.has(trophyName)) progress.earned.delete(trophyName);
  else progress.earned.add(trophyName);
  saveProgress(progress);
}

export function setCount(progress, trophyName, value) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) progress.counts[trophyName] = Math.floor(n);
  else delete progress.counts[trophyName];
  saveProgress(progress);
}

export function exportProgressJson(progress) {
  const payload = {
    app: 'leonida-legend-gta6-trophy-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...progress.earned].sort(),
    counts: progress.counts,
    spoiler: progress.spoiler,
  };
  return JSON.stringify(payload, null, 2);
}

export function importProgressJson(progress, text, validNames) {
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned : [];
  progress.earned = new Set(earned.filter((name) => validNames.has(name)));
  const counts = {};
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const [name, value] of Object.entries(parsed.counts)) {
      if (validNames.has(name) && Number.isFinite(Number(value))) counts[name] = Math.floor(Number(value));
    }
  }
  progress.counts = counts;
  progress.spoiler = parsed.spoiler === true;
  saveProgress(progress);
}

export function resetProgress(progress) {
  progress.earned = new Set();
  progress.counts = {};
  saveProgress(progress);
}
