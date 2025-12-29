// ===============================
// INTERACTION TRACKER – CORE
// ===============================

// ⚠️ Presuppone che:
// - Supabase sia già inizializzato (supabaseClient o supabase)
// - L’utente sia loggato
// - La tabella user_interactions esista

// -------- CONFIG --------
const WIDGET_ORIGIN = 'https://widget.theitalianpoetryproject.com';

// -------- LISTENER MESSAGGI DAL WIDGET --------
window.addEventListener('message', async (event) => {
  // Sicurezza: accetta SOLO dal widget
  if (event.origin !== WIDGET_ORIGIN) return;

  const data = event.data;
  if (!data || !data.type) return;

  switch (data.type) {
    case 'WIDGET_OPENED':
      await trackInteraction({
        action: 'widget',
        poemId: data.poemId,
        weight: 4
      });
      break;

    case 'WIDGET_READ':
      await trackInteraction({
        action: 'read',
        poemId: data.poemId,
        weight: 2
      });
      break;

    default:
      console.warn('[TRACKER] Evento non gestito:', data.type);
  }
});

// -------- FUNZIONE CORE --------
async function trackInteraction({ action, poemId, weight }) {
  if (!poemId) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await supabase
      .from('user_interactions')
      .insert({
        user_id: session.user.id,
        poem_id: poemId,
        action: action,
        weight: weight
      });
  } catch (err) {
    console.error('[TRACK INTERACTION ERROR]', err);
  }
}

// -------- EVENTI NATIVI DEL SITO --------

// 📖 Apertura poesia (lettura)
document.addEventListener('click', async (e) => {
  const poemEl = e.target.closest('[data-poem-id]');
  if (!poemEl) return;

  const poemId = poemEl.dataset.poemId;

  await trackInteraction({
    action: 'read',
    poemId,
    weight: 1
  });
});

// ⭐ Voto (da usare dove già invii il voto)
async function trackVote(poemId) {
  await trackInteraction({
    action: 'vote',
    poemId,
    weight: 3
  });
}

// 👉 esport opzionale se serve altrove
window.trackVote = trackVote;
