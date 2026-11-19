// Trophy detail panel: the guide in this tracker's own words, the
// missable warning when there is one, a progress counter for trophies
// whose official description carries a number, and the sources each
// guide is built from.

import { setCount } from './progress-store.js';
import { stageName } from './roadmap.js';

export function buildTrophyDetail(trophy, progress, onCountChange) {
  const detail = document.createElement('div');
  detail.className = 'trophy-detail';

  const heading = document.createElement('h3');
  heading.textContent = 'Guide';
  detail.append(heading);

  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  detail.append(guide);

  if (trophy.missable && trophy.missableNote) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = `⚠ Missable watch: ${trophy.missableNote}`;
    detail.append(note);
  }

  if (typeof trophy.count === 'number') {
    detail.append(buildCountTracker(trophy, progress, onCountChange));
  }

  const meta = document.createElement('p');
  meta.className = 'sources';
  meta.textContent = `Roadmap stage ${trophy.stage} — ${stageName(trophy.stage)} · Kind: ${trophy.kind}`;
  detail.append(meta);

  const sources = document.createElement('p');
  sources.className = 'sources';
  const label = document.createElement('b');
  label.textContent = 'Sources: ';
  sources.append(label, document.createTextNode((trophy.sources || []).join(' · ')));
  detail.append(sources);

  return detail;
}

function buildCountTracker(trophy, progress, onCountChange) {
  const wrap = document.createElement('div');
  wrap.className = 'count-tracker';

  const label = document.createElement('label');
  label.textContent = `${trophy.countLabel || 'Progress'}: `;

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(trophy.count);
  input.value = String(progress.counts[trophy.name] || 0);
  input.dataset.countFor = trophy.name;
  input.setAttribute('aria-label', `${trophy.countLabel || 'Progress'} for ${trophy.name}`);

  const of = document.createElement('span');
  of.textContent = `of ${trophy.count.toLocaleString('en-US')}`;

  const bar = document.createElement('div');
  bar.className = 'count-bar';
  const fill = document.createElement('div');
  fill.className = 'count-bar-fill';
  bar.append(fill);

  const updateFill = () => {
    const value = Math.min(Number(input.value) || 0, trophy.count);
    fill.style.width = `${Math.round((value / trophy.count) * 100)}%`;
    hint.hidden = value < trophy.count;
  };

  const hint = document.createElement('span');
  hint.className = 'count-done-hint';
  hint.textContent = 'Target reached — tick the trophy above!';
  hint.hidden = true;

  updateFill();

  input.addEventListener('change', () => {
    setCount(progress, trophy.name, input.value);
    updateFill();
    if (onCountChange) onCountChange();
  });
  input.addEventListener('input', updateFill);

  label.append(input);
  wrap.append(label, of, bar, hint);
  return wrap;
}
