
// ===============================
// INTERACTION TRACKER – CORE (FINAL)
// TheItalianPoetry
// ===============================
//
// Registra:
// - read   → lettura poesia
// - vote   → voto poesia
// - widget → apertura / lettura da widget
//
// Requisiti:
// - supabase già inizializzato (window.supabase)
// - utente autenticato
// - tabella user_interactions con colonne:
//   user_id (uuid)
//   poem_id (int)
//   action (text)
//   weight (numeric)
//   created_at (timestamp)


// -------- CONFIG --------
const WIDGET_ORIGIN = 'https://widget.theitalianpoetryproject.com';


// ===============================
// CORE FUNCTION
// ===============================
async function trackInteraction({ action, poemId, weight }) {
  console.log('[TRACK TRY]', action, poemId, weight);

  if (!poemId) {
    console.warn('[TRACK FAIL] poemId mancante');
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.warn('[TRACK FAIL] utente non loggato');
    return;
  }

  const payload = {
    user_id: session.user.id,
    poem_id: Number(poemId),
    action,
    weight
  };

  console.log('[TRACK PAYLOAD]', payload);

  const { error } = await supabase
    .from('user_interactions')
    .insert(payload);

  if (error) {
    console.error('[TRACK DB ERROR]', error);
  } else {
    console.log('[TRACK OK]');
  }
}


// ===============================
// EVENTI NATIVI DEL SITO
// ===============================

// 📖 LETTURA POESIA (click su qualunque elemento con data-poem-id)
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


// ⭐ VOTO (da chiamare DOPO voto riuscito)
async function trackVote(poemId) {
  await trackInteraction({
    action: 'vote',
    poemId,
    weight: 5
  });
}

// esposto globalmente per app.js
window.trackVote = trackVote;


// ===============================
// EVENTI DAL WIDGET (postMessage)
// ===============================
window.addEventListener('message', async (event) => {
  // sicurezza: accetta solo dal widget
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
      console.warn('[TRACKER] Evento widget non gestito:', data.type);
  }
});
