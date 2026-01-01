/* =========================================================
   ESPLORA – DISCOVERY ENGINE
   Mostra poesie fuori dalla classifica e non inflazionate
========================================================= */

import { supabase } from './supabase-init.js';

const listEl = document.getElementById('explore-poems-list');
const emptyEl = document.getElementById('explore-empty');

async function loadExplore() {
  try {
    const { data, error } = await supabase.rpc('get_explore_poems');
    if (error) throw error;

    if (!data || data.length === 0) {
      emptyEl?.classList.remove('hidden');
      return;
    }

    renderExplore(data);

  } catch (err) {
    console.error('[EXPLORE ERROR]', err);
  }
}

function renderExplore(poems) {
  listEl.innerHTML = '';

  poems.forEach(poem => {
    const li = document.createElement('li');
    li.className = 'ai-poem-card explore';

    li.innerHTML = `
      <h3>${poem.title}</h3>
      <p class="author">di ${poem.author_name}</p>

      <p class="preview">
        ${(poem.content || '').slice(0, 140)}…
      </p>

      <div class="ai-meta">
        <span class="badge-explore">🌿 Scoperta</span>
      </div>
    `;

    listEl.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', loadExplore);
