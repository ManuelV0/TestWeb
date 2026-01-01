/* =========================================================
   CLASSIFICA INTELLIGENTE – CORE LOGIC (FIXED)
   TheItalianPoetry
========================================================= */

/* ================= SUPABASE ================= */

// 🔥 USA L’ISTANZA GLOBALE (OBBLIGATORIO)
const supabase = window.supabaseClient;

if (!supabase) {
  console.error('[AI CLASSIFICA] supabaseClient non inizializzato');
  throw new Error('Supabase client mancante');
}

/* ================= DOM ================= */

const statusBox = document.getElementById('ai-status');
const poemsList = document.getElementById('ai-poems-list');
const emptyState = document.getElementById('ai-empty-state');

/* ================= STATUS ================= */

function setStatus(text) {
  statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
  statusBox.classList.remove('hidden');
}

function clearStatus() {
  statusBox.innerHTML = '';
  statusBox.classList.add('hidden');
}

/* ================= DEBUG ================= */

function debug(message, data = null) {
  statusBox.classList.remove('hidden');

  const pre = document.createElement('pre');
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.fontSize = '13px';
  pre.style.background = '#111';
  pre.style.color = '#0f0';
  pre.style.padding = '1rem';
  pre.style.marginTop = '1rem';
  pre.style.borderRadius = '8px';
  pre.style.border = '1px solid #0f0';

  pre.textContent =
    '[DEBUG]\n' +
    message +
    (data ? '\n\n' + JSON.stringify(data, null, 2) : '');

  statusBox.appendChild(pre);
}

/* ================= AUTH ================= */

async function requireAuth() {
  const { data, error } = await supabase.auth.getSession();

  debug('AUTH CHECK', { session: data?.session });

  if (error) throw error;

  if (!data?.session) {
    setStatus('❌ Devi essere loggato per vedere la classifica intelligente.');
    throw new Error('NOT_AUTHENTICATED');
  }

  return data.session.user.id;
}

/* ================= RENDER ================= */

function renderPoems(poems) {
  poemsList.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    li.className = 'ai-poem-card';
    li.dataset.poemId = poem.id;

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name || 'Anonimo'}</p>
      <p class="preview">${(poem.content || '').slice(0, 160)}…</p>
      <span class="score">
        Affinità: ${Number(poem.affinity_score).toFixed(2)}
      </span>
    `;

    poemsList.appendChild(li);
  });
}

/* ================= CORE ================= */

async function loadIntelligentRanking() {
  try {
    setStatus('Analisi delle tue preferenze in corso…');
    debug('START LOAD');

    const userId = await requireAuth();
    debug('USER AUTHENTICATED', { userId });

    // ⚠️ RPC USA LA SESSIONE CORRENTE
    const { data, error } = await supabase.rpc('get_intelligent_poems');

    debug('RPC RESPONSE', { data, error });

    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      debug('EMPTY RESULT');
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    renderPoems(data);

  } catch (err) {
    console.error('[AI CLASSIFICA ERROR]', err);

    setStatus('❌ Errore nel caricamento della classifica intelligente.');

    debug('FINAL ERROR', {
      message: err.message,
      stack: err.stack
    });
  }
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadIntelligentRanking);