// The `generated` time of the stats.json this build used (empty if it couldn't be read). The deploy
// workflow's scheduled check compares it with the live stats.json and only rebuilds when they differ.
import type { APIRoute } from 'astro';
import { getStats } from '../lib/stats';

export const GET: APIRoute = async () => {
  const stats = await getStats();
  return new Response(`${stats?.generated ?? ''}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
