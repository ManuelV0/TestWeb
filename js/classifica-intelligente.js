// ❌ niente createClient qui
const supabase = window.supabaseClient;

if (!supabase) {
  throw new Error('Supabase non inizializzato');
}

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    setStatus('Devi essere loggato per vedere la classifica intelligente.');
    throw new Error('NOT_AUTHENTICATED');
  }
  return session.user.id;
}

async function loadIntelligentRanking() {
  try {
    setStatus('Analisi delle tue preferenze in corso…');

    await requireAuth();

    const { data, error } = await supabase.rpc('get_intelligent_poems');
    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    renderPoems(data);

  } catch (err) {
    console.error('[AI CLASSIFICA ERROR]', err);
  }
}

document.addEventListener('DOMContentLoaded', loadIntelligentRanking);