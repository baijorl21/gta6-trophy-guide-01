// Trophy checklist: one card per trophy with its official name,
// description and grade, an earned checkbox, kind/missable/stage tags and
// an expandable guide. Filters live here too: kind, grade, status,
// roadmap stage and free-text search.

import { toggleEarned } from './progress-store.js';
import { isSpoilerMasked, maskedName, maskedDescription } from './spoiler.js';
import { buildTrophyDetail } from './trophy-detail.js';
import { stageName } from './roadmap.js';

export function trophyMatchesFilters(trophy, filters, progress) {
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.stage !== null && trophy.stage !== filters.stage) return false;
  const earned = progress.earned.has(trophy.name);
  if (filters.status === 'earned' && !earned) return false;
  if (filters.status === 'remaining' && earned) return false;
  if (filters.search) {
    const masked = isSpoilerMasked(trophy, progress);
    const haystack = masked
      ? ''
      : `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(filters.search)) return false;
  }
  return true;
}

export function renderTrophyList(container, trophies, filters, progress, openGuides, callbacks) {
  container.replaceChildren();
  const visible = trophies.filter((t) => trophyMatchesFilters(t, filters, progress));
  for (const trophy of visible) {
    container.append(buildTrophyCard(trophy, progress, openGuides, callbacks));
  }
  return visible.length;
}

function buildTrophyCard(trophy, progress, openGuides, callbacks) {
  const earned = progress.earned.has(trophy.name);
  const masked = isSpoilerMasked(trophy, progress);

  const card = document.createElement('article');
  card.className = `trophy-card grade-${trophy.grade}` + (earned ? ' is-earned' : '') + (masked ? ' spoiler-masked' : '');
  card.dataset.trophyName = trophy.name;

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'trophy-check';
  checkbox.checked = earned;
  checkbox.setAttribute('aria-label', `Mark ${masked ? 'this story trophy' : trophy.name} as earned`);
  checkbox.addEventListener('change', () => {
    toggleEarned(progress, trophy.name);
    callbacks.onProgressChange();
  });

  const titles = document.createElement('div');
  titles.className = 'trophy-titles';
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = masked ? maskedName() : trophy.name;
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? maskedDescription() : trophy.description;
  titles.append(name, desc, buildTags(trophy, masked));

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.dataset.guideFor = trophy.name;
  const isOpen = openGuides.has(trophy.name) && !masked;
  toggle.textContent = masked ? 'Hidden' : isOpen ? 'Hide guide' : 'Guide';
  toggle.disabled = masked;
  toggle.addEventListener('click', () => callbacks.onToggleGuide(trophy.name));

  head.append(checkbox, titles, toggle);
  card.append(head);

  if (isOpen) {
    card.append(buildTrophyDetail(trophy, progress, callbacks.onProgressChange));
  }
  return card;
}

function buildTags(trophy, masked) {
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';

  const grade = document.createElement('span');
  grade.className = `tag tag-grade-${trophy.grade}`;
  grade.textContent = trophy.grade;
  tags.append(grade);

  if (!masked) {
    const kind = document.createElement('span');
    kind.className = 'tag';
    kind.textContent = trophy.kind;
    tags.append(kind);
  }

  if (trophy.missable) {
    const missable = document.createElement('span');
    missable.className = 'tag tag-missable';
    missable.textContent = '⚠ Missable';
    tags.append(missable);
  }

  const stage = document.createElement('span');
  stage.className = 'tag tag-stage';
  stage.textContent = `Stage ${trophy.stage} · ${stageName(trophy.stage)}`;
  tags.append(stage);

  return tags;
}
