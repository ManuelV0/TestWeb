/* =========================================================
   CLASSIFICA INTELLIGENTE – CORE LOGIC (DEBUG MODE)
   TheItalianPoetry
========================================================= */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

/* ================= CONFIG ================= */

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q';

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

/* ================= DEBUG VISIVO ================= */

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

  debug('AUTH CHECK', { data, error });

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
      <p class="author">di ${poem.author_name}</p>
      <p class="preview">${(poem.content || '').slice(0, 160)}…</p>
      <span class="score">Affinità: ${Number(poem.affinity_score).toFixed(2)}</span>
    `;

    poemsList.appendChild(li);
  });
}

/* ================= CORE LOAD ================= */

async function loadIntelligentRanking() {
  try {
    setStatus('Analisi delle tue preferenze in corso…');
    debug('START LOAD');

    const userId = await requireAuth();
    debug('USER AUTHENTICATED', { userId });

    const { data, error } = await supabase.rpc('get_intelligent_poems');
    debug('RPC RESPONSE', { data, error });

    if (error) throw error;

    clearStatus();

    if (!data || data.length === 0) {
      debug('EMPTY RESULT');
      emptyState.classList.remove('hidden');
      emptyState.setAttribute('aria-hidden', 'false');
      return;
    }

    emptyState.classList.add('hidden');
    emptyState.setAttribute('aria-hidden', 'true');

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