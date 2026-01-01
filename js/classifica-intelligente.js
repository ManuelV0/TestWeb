/* =========================================================
   CLASSIFICA INTELLIGENTE – UX “IL SISTEMA IMPARA”
========================================================= */

// 🔥 USA SOLO L’ISTANZA GLOBALE
const supabase = window.supabaseClient;

if (!supabase) {
  console.error('❌ supabaseClient non inizializzato');
  throw new Error('SUPABASE_NOT_READY');
}

/* ================= DOM ================= */

const statusBox = document.getElementById('ai-status');
const poemsList = document.getElementById('ai-poems-list');
const emptyState = document.getElementById('ai-empty-state');

/* ================= STATO ================= */

let previousPoemIds = new Set();

/* ================= STATUS ================= */

function setStatus(text) {
  if (!statusBox) return;
  statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
  statusBox.classList.remove('hidden');
}

function clearStatus() {
  if (!statusBox) return;
  statusBox.innerHTML = '';
  statusBox.classList.add('hidden');
}

/* ================= AUTH ================= */

async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) {
    setStatus('❌ Devi essere loggato per vedere la classifica intelligente.');
    throw new Error('NOT_AUTHENTICATED');
  }
  return data.session.user.id;
}

/* ================= RENDER ================= */

function renderPoems(poems) {
  if (!poemsList) return;

  poemsList.innerHTML = '';

  const currentIds = new Set(poems.map(p => String(p.id)));

  poems.forEach(poem => {
    const isNew = !previousPoemIds.has(String(poem.id));

    const li = document.createElement('li');
    li.className = 'ai-poem-card';
    li.dataset.poemId = poem.id;

    if (isNew) li.classList.add('is-new');

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name}</p>

      <p class="preview">
        ${(poem.content || '').slice(0, 160)}…
      </p>

      <div class="ai-meta">
        <span class="score">
          Affinità: ${Number(poem.affinity_score).toFixed(2)}
        </span>

        ${isNew ? `<span class="badge-new">✨ Nuova per te</span>` : ''}
      </div>
    `;

    poemsList.appendChild(li);
  });

  previousPoemIds = currentIds;
}

/* ================= CORE ================= */

async function loadIntelligentRanking() {
  try {
    setStatus('Analisi delle tue preferenze in corso…');

    await requireAuth();

    const { data, error } = await supabase.rpc('get_intelligent_poems');
    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      emptyState?.classList.remove('hidden');
      return;
    }

    emptyState?.classList.add('hidden');
    renderPoems(data);

  } catch (err) {
    console.error('[AI CLASSIFICA ERROR]', err);
    setStatus('❌ Errore nel caricamento della classifica intelligente.');
  }
}

/* ================= AUTO REFRESH ================= */

let refreshTimeout;
window.addEventListener('interaction-updated', () => {
  clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(loadIntelligentRanking, 400);
});

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadIntelligentRanking);
