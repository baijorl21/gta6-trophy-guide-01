// Platinum roadmap: the seven stages every trophy belongs to, in the order
// that wastes the least time. Stage membership comes from each trophy's
// official description (story chapters and missions first, collectibles
// and money grinds last).

export const ROADMAP_STAGES = [
  { stage: 1, name: 'Story run', blurb: 'Chapters and named missions, start to finale.' },
  { stage: 2, name: 'Missable watchlist', blurb: 'One-time moments and choices — catch these during the story.' },
  { stage: 3, name: 'Side strands', blurb: 'Strangers & Freaks and the character mission chains.' },
  { stage: 4, name: 'Activities & challenges', blurb: 'Races, shooting range, robberies, feats and challenges.' },
  { stage: 5, name: 'Collectibles cleanup', blurb: 'Stunts, cards, WAiNK spots, vehicles and the full map.' },
  { stage: 6, name: 'Money & properties', blurb: 'Laundering, spending, garages and the Scooter Bros app.' },
  { stage: 7, name: '100% + Platinum', blurb: 'Finish the completion checklist, then the platinum pops.' },
];

export function stageName(stageNumber) {
  const found = ROADMAP_STAGES.find((s) => s.stage === stageNumber);
  return found ? found.name : `Stage ${stageNumber}`;
}

export function renderRoadmap(container, trophies, progress, activeStage, onSelectStage) {
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const inStage = trophies.filter((t) => t.stage === stage.stage);
    const earned = inStage.filter((t) => progress.earned.has(t.name)).length;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'stage-card' + (activeStage === stage.stage ? ' is-active' : '');
    card.dataset.stage = String(stage.stage);
    card.addEventListener('click', () => onSelectStage(activeStage === stage.stage ? null : stage.stage));

    const num = document.createElement('div');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage}`;
    const name = document.createElement('div');
    name.className = 'stage-name';
    name.textContent = stage.name;
    const blurb = document.createElement('p');
    blurb.className = 'stage-blurb';
    blurb.textContent = stage.blurb;
    const count = document.createElement('div');
    count.className = 'stage-count';
    count.textContent = `${earned} of ${inStage.length} earned`;
    const bar = document.createElement('div');
    bar.className = 'stage-bar';
    const fill = document.createElement('div');
    fill.className = 'stage-bar-fill';
    fill.style.width = inStage.length ? `${Math.round((earned / inStage.length) * 100)}%` : '0%';
    bar.append(fill);

    card.append(num, name, blurb, count, bar);
    container.append(card);
  }
}
