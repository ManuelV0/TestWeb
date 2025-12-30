// interaction-tracker.js
// USA l'istanza Supabase globale del sito

export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  if (!window.supabaseClient) {
    console.error('[TRACK] supabaseClient non disponibile');
    return;
  }

  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) {
    console.warn('[TRACK] utente non loggato');
    return;
  }

  const { error } = await window.supabaseClient
    .from('user_interactions')
    .insert({
      user_id: session.user.id,
      poem_id: Number(poemId),
      action,
      weight
    });

  if (error) {
    console.error('[TRACK INSERT ERROR]', error);
  } else {
    console.log('[TRACK OK]', action, poemId, weight);
  }
}
