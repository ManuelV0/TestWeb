/* =========================================================
   ESPLORA – INIT
========================================================= */

const supabase = window.supabaseClient;

if (!supabase) {
  console.error('❌ supabaseClient non inizializzato');
  throw new Error('SUPABASE_NOT_READY');
}

/* ================= DOM ================= */

const listEl = document.getElementById('explore-poems-list');
const emptyEl = document.getElementById('explore-empty');

/* ================= CORE ================= */

async function loadExplore() {
  try {
    console.log('[EXPLORE] loading…');

    const { data, error } = await supabase
      .rpc('get_explore_poems'); // funzione SQL dedicata

    if (error) throw error;

    if (!data || data.length === 0) {
      emptyEl?.classList.remove('hidden');
      return;
    }

    emptyEl?.classList.add('hidden');
    renderExplore(data);

  } catch (err) {
    console.error('[EXPLORE ERROR]', err);
  }
}

/* ================= RENDER ================= */

function renderExplore(poems) {
  listEl.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    li.className = 'ai-poem-card';

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name}</p>
      <p class="preview">
        ${(poem.content || '').slice(0, 160)}…
      </p>
    `;

    listEl.appendChild(li);
  });
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadExplore);
