
/* =========================================================
   CLASSIFICA INTELLIGENTE – FULL UX VERSION (FINAL)
========================================================= */

const supabase = window.supabaseClient;
if (!supabase) throw new Error('SUPABASE_NOT_READY');

/* ================= DOM ================= */

const statusBox = document.getElementById('ai-status');
const poemsList = document.getElementById('ai-poems-list');
const emptyState = document.getElementById('ai-empty-state');

/* ================= PERSISTENZA (CLIENT) ================= */

const SEEN_KEY = 'ai_seen_poems';
const AB_KEY = 'ai_ab_variant';

const getSeen = () =>
  new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));

const saveSeen = set =>
  localStorage.setItem(SEEN_KEY, JSON.stringify([...set]));

/* 🧪 A/B test
   A = mostra spiegazione
   B = non mostra spiegazione
*/
const AB_VARIANT =
  localStorage.getItem(AB_KEY) ||
  (Math.random() > 0.5 ? 'A' : 'B');

localStorage.setItem(AB_KEY, AB_VARIANT);

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
    setStatus('❌ Devi essere loggato per vedere la classifica.');
    throw new Error('NOT_AUTH');
  }
}

/* ================= RENDER ================= */

function renderPoems(poems) {
  if (!poemsList) return;

  const seen = getSeen();
  const newSeen = new Set(poems.map(p => String(p.id)));

  poemsList.innerHTML = '';

  poems.forEach((poem, index) => {
    const id = String(poem.id);
    const isNew = seen.size > 0 && !seen.has(id);

    const li = document.createElement('li');
    li.className = 'ai-poem-card';
    li.style.setProperty('--order', index);

    if (isNew) li.classList.add('is-new');

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name}</p>

      <p class="preview">
        ${(poem.content || '').slice(0, 160)}…
      </p>

      <div class="ai-meta">
        <span class="score">
          Affinità ${Number(poem.affinity_score).toFixed(2)}
        </span>

        ${isNew ? `<span class="badge-new">✨ Nuova per te</span>` : ''}
      </div>

      ${
        AB_VARIANT === 'A' && poem.affinity_score >= 0.6
          ? `<p class="ai-reason">
               Suggerita perché simile alle poesie che leggi più spesso
             </p>`
          : ''
      }
    `;

    poemsList.appendChild(li);
  });

  saveSeen(newSeen);
}

/* ================= CORE ================= */

async function loadIntelligentRanking() {
  try {
    setStatus('Il sistema sta imparando da te…');
    await requireAuth();

    const { data, error } = await supabase.rpc('get_intelligent_poems');
    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      emptyState?.classList.remove('hidden');
      return;
    }

    emptyState?.classList.add('hidden');

    animateReorder();
    renderPoems(data);

  } catch (err) {
    console.error('[AI CLASSIFICA ERROR]', err);
    setStatus('❌ Errore nel caricamento della classifica intelligente.');
  }
}

/* ================= ANIMAZIONE RIORDINO ================= */

function animateReorder() {
  if (!poemsList) return;
  poemsList.classList.remove('animate');
  void poemsList.offsetWidth; // force reflow
  poemsList.classList.add('animate');
}

/* ================= AUTO REFRESH ================= */

let refreshTimeout;
window.addEventListener('interaction-updated', () => {
  clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(loadIntelligentRanking, 400);
});

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadIntelligentRanking);
