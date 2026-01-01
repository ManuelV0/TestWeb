
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

/* ================= STATO PERSISTENTE ================= */

// 👉 memorizziamo cosa l’utente ha GIÀ visto
const STORAGE_KEY = 'ai_seen_poems';

function getSeenPoems() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
  } catch {
    return new Set();
  }
}

function saveSeenPoems(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

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

  const seenPoems = getSeenPoems();
  const currentIds = new Set(poems.map(p => String(p.id)));

  poems.forEach(poem => {
    const poemId = String(poem.id);

    // ✨ “Nuova per te” SOLO se:
    // - NON è il primo caricamento
    // - NON l’utente l’ha già vista
    const isNew = seenPoems.size > 0 && !seenPoems.has(poemId);

    const li = document.createElement('li');
    li.className = 'ai-poem-card';
    li.dataset.poemId = poemId;

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

        ${
          isNew
            ? `<span class="badge-new" title="Il sistema ha imparato qualcosa di nuovo su di te">
                 ✨ Nuova per te
               </span>`
            : ''
        }
      </div>
    `;

    poemsList.appendChild(li);
  });

  // 🔒 aggiorniamo ciò che l’utente ha ormai visto
  saveSeenPoems(currentIds);
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
