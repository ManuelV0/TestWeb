/* =========================================================
   CLASSIFICA INTELLIGENTE – CORE LOGIC
   TheItalianPoetry
========================================================= */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* ================= CONFIG ================= */

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY =
  'INSERISCI_QUI_LA_TUA_ANON_KEY_REALE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

/* ================= AUTH ================= */

async function requireAuth() {
  const { data, error } = await supabase.auth.getSession();

  console.log('[AI] session:', data?.session);

  if (error || !data.session) {
    setStatus('Devi essere loggato per vedere la classifica intelligente.');
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
      <p class="author">di ${poem.author_name ?? 'Anonimo'}</p>
      <p class="preview">
        ${(poem.content || '').slice(0, 160)}…
      </p>
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
    console.log('[AI] start load');

    setStatus('Analisi delle tue preferenze in corso…');

    const userId = await requireAuth();
    console.log('[AI] user authenticated:', userId);

    const { data, error } = await supabase.rpc('get_intelligent_poems');

    console.log('[AI] rpc response:', { data, error });

    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      emptyState.classList.remove('hidden');
      emptyState.setAttribute('aria-hidden', 'false');
      return;
    }

    emptyState.classList.add('hidden');
    emptyState.setAttribute('aria-hidden', 'true');

    renderPoems(data);

  } catch (err) {
    console.error('[AI CLASSIFICA ERROR]', err);

    if (err.message !== 'NOT_AUTHENTICATED') {
      setStatus('Errore nel caricamento della classifica intelligente.');
    }
  }
}

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadIntelligentRanking);