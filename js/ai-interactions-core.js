// ai-interactions-core.js

export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  // ✅ PRENDIAMO SEMPRE L’ISTANZA DAL WINDOW
  const supabase = window.supabaseClient;
  if (!supabase) {
    console.error('[TRACK] supabaseClient non trovato');
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.warn('[TRACK] utente non loggato');
    return;
  }

  const { data, error } = await supabase
    .from('user_interactions')
    .insert({
      user_id: session.user.id,
      poem_id: Number(poemId),
      action,
      weight
    })
    .select(); // 🔥 OBBLIGATORIO

  if (error) {
    console.error('[TRACK INSERT ERROR]', error);
  } else {
    console.log('[TRACK OK]', data);
  }
}
