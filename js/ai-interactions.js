import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ⚠️ USA SEMPRE LA STESSA CONFIG DEL SITO
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'TUO_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Traccia un'interazione utente
 */
export async function trackInteraction({ action, poemId }) {
  if (!poemId) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return; // SOLO UTENTI LOGGATI

  const weight =
    action === 'widget' ? 4 :
    action === 'vote'   ? 3 :
    action === 'read'   ? 1 :
    0.5;

  await supabase
    .from('user_interactions')
    .insert({
      user_id: session.user.id,
      poem_id: poemId,
      action,
      weight
    });
}
