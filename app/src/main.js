// Leonida Legend bootstrap: loads the official 55-trophy list from
// data/trophies.json (a file inside app/, so the guide works fully
// offline), wires the toolbar, roadmap and checklist together, and keeps
// the progress summary in sync.

import {
  loadProgress,
  saveProgress,
  exportProgressJson,
  importProgressJson,
  resetProgress,
} from './progress-store.js';
import { renderRoadmap } from './roadmap.js';
import { renderTrophyList } from './trophy-list.js';

const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const progress = loadProgress();
const filters = { kind: 'all', grade: 'all', status: 'all', stage: null, search: '' };
const openGuides = new Set();

let trophies = [];

const els = {
  earnedCount: document.getElementById('earned-count'),
  overallFill: document.getElementById('overall-fill'),
  gradeBars: document.getElementById('grade-bars'),
  stageGrid: document.getElementById('stage-grid'),
  trophyList: document.getElementById('trophy-list'),
  emptyState: document.getElementById('empty-state'),
  resultCount: document.getElementById('result-count'),
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('grade-filter'),
  statusFilter: document.getElementById('status-filter'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  kindChips: document.getElementById('kind-chips'),
  exportButton: document.getElementById('export-progress'),
  importInput: document.getElementById('import-progress'),
  resetButton: document.getElementById('reset-progress'),
};

function renderProgressSummary() {
  const earned = trophies.filter((t) => progress.earned.has(t.name)).length;
  els.earnedCount.textContent = String(earned);
  els.overallFill.style.width = trophies.length ? `${Math.round((earned / trophies.length) * 100)}%` : '0%';
  els.gradeBars.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => progress.earned.has(t.name)).length;
    const span = document.createElement('span');
    const dot = document.createElement('span');
    dot.className = 'grade-dot';
    dot.style.background = `var(--${grade})`;
    const bold = document.createElement('b');
    bold.textContent = `${got}/${inGrade.length}`;
    span.append(dot, document.createTextNode(`${grade} `), bold);
    els.gradeBars.append(span);
  }
}

function renderAll() {
  renderProgressSummary();
  renderRoadmap(els.stageGrid, trophies, progress, filters.stage, (stage) => {
    filters.stage = stage;
    renderAll();
  });
  const shown = renderTrophyList(els.trophyList, trophies, filters, progress, openGuides, {
    onProgressChange: renderAll,
    onToggleGuide: (name) => {
      if (openGuides.has(name)) openGuides.delete(name);
      else openGuides.add(name);
      renderAll();
    },
  });
  els.emptyState.hidden = shown !== 0;
  els.resultCount.textContent = `Showing ${shown} of ${trophies.length} trophies`;
  els.spoilerToggle.checked = progress.spoiler;
}

function wireToolbar() {
  els.search.addEventListener('input', () => {
    filters.search = els.search.value.trim().toLowerCase();
    renderAll();
  });
  els.gradeFilter.addEventListener('change', () => {
    filters.grade = els.gradeFilter.value;
    renderAll();
  });
  els.statusFilter.addEventListener('change', () => {
    filters.status = els.statusFilter.value;
    renderAll();
  });
  els.spoilerToggle.addEventListener('change', () => {
    progress.spoiler = els.spoilerToggle.checked;
    saveProgress(progress);
    renderAll();
  });
  els.kindChips.addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    filters.kind = button.dataset.kind;
    for (const chip of els.kindChips.querySelectorAll('[data-kind]')) {
      chip.classList.toggle('is-active', chip === button);
    }
    renderAll();
  });
  els.exportButton.addEventListener('click', () => {
    const blob = new Blob([exportProgressJson(progress)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'leonida-legend-progress.json';
    link.click();
    URL.revokeObjectURL(link.href);
  });
  els.importInput.addEventListener('change', async () => {
    const file = els.importInput.files[0];
    if (!file) return;
    try {
      importProgressJson(progress, await file.text(), new Set(trophies.map((t) => t.name)));
      renderAll();
    } catch {
      els.resultCount.textContent = 'Import failed: that file is not a Leonida Legend progress export.';
    }
    els.importInput.value = '';
  });
  els.resetButton.addEventListener('click', () => {
    resetProgress(progress);
    renderAll();
  });
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  trophies = Array.isArray(doc) ? doc : doc.trophies;
}

wireToolbar();
await loadTrophies();
renderAll();
