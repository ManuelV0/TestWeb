export async function trackInteraction({ action, poemId, weight = 1 }) {
  if (!poemId) return;

  const client = window.supabaseClient;
  if (!client) {
    console.error('[TRACK] supabaseClient assente');
    return;
  }

  const { data: { session } } = await client.auth.getSession();

  console.log('[TRACK USER]', session?.user?.id);

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
    console.error('[TRACK INSERT ERROR]', error);
  } else {
    console.log('[TRACK OK]', action, poemId);
  }
}