
import { supabaseClient } from './app.js';

export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { error } = await supabaseClient
    .from('user_interactions')
    .insert({
      user_id: session.user.id,
      poem_id: Number(poemId),
      action,
      weight
    });

  if (error) {
    console.error('[TRACK ERROR]', error);
  } else {
    console.log('[TRACK OK]', action, poemId, weight);
  }
}

export const trackVote = (poemId) =>
  trackInteraction({ action: 'vote', poemId, weight: 5 });
