import type { CollectionEntry } from 'astro:content';

type Status = CollectionEntry<'games'>['data']['status'];

/** The chip shown for a game's status on its card and its page. */
export const statusChip: Record<Status, { label: string; className: string }> = {
  playable: { label: 'Playable', className: 'chip--playable' },
  'in-development': { label: 'Coming soon', className: 'chip--soon' },
  planned: { label: 'Planned', className: 'chip--planned' },
};
