
// js/interaction-tracker.js
// USA l'istanza già autenticata del sito

export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  // 👇 usa la stessa istanza Supabase di app.js
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    console.warn('[TRACK] utente non loggato');
    return;
  }

  const { error } = await supabaseClient
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
