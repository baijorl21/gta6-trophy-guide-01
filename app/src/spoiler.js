// Spoiler shield: while it is on, story trophies that are not earned yet
// show a masked placeholder instead of their name and description, so the
// checklist can be used without spoiling the campaign.

export function isSpoilerMasked(trophy, progress) {
  return progress.spoiler && trophy.kind === 'story' && !progress.earned.has(trophy.name);
}

export function maskedName() {
  return 'Story trophy — hidden by spoiler shield';
}

export function maskedDescription() {
  return 'Earn this trophy to reveal its name and description.';
}
