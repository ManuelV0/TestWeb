// interaction-tracker.js
// Usa l’istanza Supabase già autenticata del sito

export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    console.warn('[TRACK] utente non loggato');
    return;
  }

  const { error } = await supabaseClient
    .from('user_interactions')
    .insert({
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
