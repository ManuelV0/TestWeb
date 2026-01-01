
export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  const client = window.supabaseClient;
  if (!client) {
    console.error('[TRACK] supabaseClient assente');
    return;
  }

  const { data: { session } } = await client.auth.getSession();
  if (!session) return;

  const { error } = await client
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

    // 🔥 EVENTO GLOBALE
    window.dispatchEvent(
      new CustomEvent('interaction-updated', {
        detail: { action, poemId, weight }
      })
    );
  }
}

// helper
export const trackVote = (poemId) =>
  trackInteraction({ action: 'vote', poemId, weight: 5 });
