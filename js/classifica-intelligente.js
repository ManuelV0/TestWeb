/* =========================================================
   CLASSIFICA INTELLIGENTE – CORE LOGIC
   TheItalianPoetry
========================================================= */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* ================= CONFIG ================= */

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'INSERISCI_LA_TUA_ANON_KEY_QUI'; // 👈 OBBLIGATORIO

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ================= DOM ================= */

const statusBox = document.getElementById('ai-status');
const poemsList = document.getElementById('ai-poems-list');
const emptyState = document.getElementById('ai-empty-state');

/* ================= UTILS ================= */

function setStatus(text) {
  statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
}

function clearStatus() {
  statusBox.innerHTML = '';
}

/* ================= AUTH CHECK ================= */

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    setStatus('Devi essere loggato per vedere la classifica intelligente.');
    throw new Error('NOT_AUTHENTICATED');
  }

  return session.user.id;
}

/* ================= RENDER ================= */

function renderPoems(poems) {
  poemsList.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    li.className = 'ai-poem-card';

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name}</p>
      <p class="preview">${poem.content.slice(0, 160)}…</p>
      <span class="score">Affinità: ${poem.affinity_score.toFixed(2)}</span>
    `;

    li.addEventListener('click', () => {
      trackInteraction(poem.id, 'open');
      window.location.href = `index.html#poem-${poem.id}`;
    });

    poemsList.appendChild(li);
  });
}

/* ================= INTERACTION TRACKING ================= */

async function trackInteraction(poemId, type) {
  try {
    await supabase.from('user_interactions').insert({
      poem_id: poemId,
      interaction_type: type
    });
  } catch (err) {
    console.warn('[TRACK ERROR]', err.message);
  }
}

/* ================= CORE LOAD ================= */

async function loadIntelligentRanking() {
  try {
    setStatus('Analisi delle tue preferenze in corso…');

    const userId = await requireAuth();

    const { data, error } = await supabase.rpc(
      'get_intelligent_poems_for_user',
      { p_user_id: userId }
    );

    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      emptyState.classList.remove('hidden');
      emptyState.setAttribute('aria-hidden', 'false');
      return;
    }

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
