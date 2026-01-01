/* =========================================================
   ESPLORA / POESIE CONSIGLIATE – CORE
========================================================= */

(async () => {

/* ================= SAFE SUPABASE ================= */

async function waitForSupabase(retries = 15) {
  return new Promise((resolve, reject) => {
    const check = () => {
      if (window.supabaseClient) {
        resolve(window.supabaseClient);
      } else if (retries <= 0) {
        reject(new Error('SUPABASE_NOT_READY'));
      } else {
        setTimeout(() => check(--retries), 100);
      }
    };
    check();
  });
}

const supabase = await waitForSupabase();

/* ================= DOM ================= */

const statusBox = document.getElementById('explore-status');
const poemsList = document.getElementById('explore-poems-list');
const emptyState = document.getElementById('explore-empty');

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
    setStatus('❌ Accedi per vedere le poesie consigliate.');
    throw new Error('NOT_AUTHENTICATED');
  }
  return data.session.user.id;
}

/* ================= RENDER ================= */

function renderPoems(poems) {
  if (!poemsList) return;
  poemsList.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    li.className = 'ai-poem-card';
    if (poem.is_new) li.classList.add('is-new');

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name}</p>

      <p class="preview">
        ${(poem.content || '').slice(0, 160)}…
      </p>

      <div class="ai-meta">
        <span class="score">
          Affinità ${Number(poem.affinity_score || 0).toFixed(2)}
        </span>
        ${poem.is_new ? `<span class="badge-new">✨ Nuova per te</span>` : ''}
      </div>

      <p class="ai-reason">
        Suggerita perché simile alle poesie che hai apprezzato
      </p>
    `;
    poemsList.appendChild(li);
  });
}

/* ================= CORE ================= */

async function loadExplore() {
  try {
    setStatus('Stiamo esplorando per te…');

    await requireAuth();

    const { data, error } = await supabase.rpc('get_intelligent_poems');
    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      emptyState?.classList.remove('hidden');
      return;
    }

    emptyState?.classList.add('hidden');
    renderPoems(data.slice(0, 12));

  } catch (err) {
    console.error('[ESPLORA ERROR]', err);
    setStatus('❌ Errore nel caricamento delle poesie consigliate.');
  }
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadExplore);

})();
