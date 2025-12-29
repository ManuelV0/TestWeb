// ===============================
// Classifica Intelligente – CORE
// ===============================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// 🔐 CONFIG SUPABASE
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'INSERISCI_LA_TUA_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🎯 ELEMENTI DOM
const statusSection = document.getElementById('ai-status');
const poemsList = document.getElementById('ai-poems-list');
const emptyState = document.getElementById('ai-empty-state');

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', init);

async function init() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    showError('Devi effettuare l’accesso per vedere la classifica intelligente.');
    return;
  }

  await loadClassificaIntelligente();
}

// ===============================
// LOAD DATA
// ===============================
async function loadClassificaIntelligente() {
  setLoading(true);

  const { data, error } = await supabase
    .rpc('classifica_intelligente');

  if (error) {
    console.error('[AI CLASSIFICA ERROR]', error);
    showError('Errore nel caricamento delle poesie.');
    return;
  }

  if (!data || data.length === 0) {
    showEmptyState();
    return;
  }

  renderPoems(data);
  setLoading(false);
}

// ===============================
// RENDER
// ===============================
function renderPoems(poems) {
  poemsList.innerHTML = '';

  poems.forEach((poem, index) => {
    const li = document.createElement('li');
    li.className = 'ai-poem-card';
    li.dataset.poemId = poem.id;

    li.innerHTML = `
      <article>
        <header class="ai-poem-header">
          <span class="ai-rank">#${index + 1}</span>
          <h2 class="ai-poem-title">${escapeHTML(poem.title)}</h2>
        </header>

        <p class="ai-poem-author">di ${escapeHTML(poem.author_name)}</p>

        <div class="ai-poem-content">
          ${formatContent(poem.content)}
        </div>

        <footer class="ai-poem-footer">
          <span class="ai-score">
            Affinità: ${Number(poem.score).toFixed(2)}
          </span>
        </footer>
      </article>
    `;

    // 🔥 TRACK INTERACTION (OPEN)
    li.addEventListener('click', () => {
      trackInteraction(poem.id, 'open_poem', 1);
    });

    poemsList.appendChild(li);
  });

  emptyState.classList.add('hidden');
  emptyState.setAttribute('aria-hidden', 'true');
}

// ===============================
// TRACK INTERACTIONS
// ===============================
async function trackInteraction(poemId, type, value = 1) {
  try {
    await supabase.from('user_interactions').insert({
      poem_id: poemId,
      interaction_type: type,
      value
    });
  } catch (err) {
    console.warn('[TRACK INTERACTION FAILED]', err);
  }
}

// ===============================
// UI STATES
// ===============================
function setLoading(isLoading) {
  if (isLoading) {
    statusSection.innerHTML = `<p class="loading-text">Analisi delle tue preferenze in corso…</p>`;
  } else {
    statusSection.innerHTML = '';
  }
}

function showError(message) {
  statusSection.innerHTML = `<p class="error-text">${message}</p>`;
}

function showEmptyState() {
  setLoading(false);
  emptyState.classList.remove('hidden');
  emptyState.setAttribute('aria-hidden', 'false');
}

// ===============================
// UTILS
// ===============================
function escapeHTML(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatContent(text = '') {
  return text
    .split('\n')
    .slice(0, 6)
    .map(line => `<p>${escapeHTML(line)}</p>`)
    .join('');
}
