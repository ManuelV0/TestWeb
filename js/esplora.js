/* =========================================================
   ESPLORA / POESIE CONSIGLIATE – VERSIONE FINALE
   Stato: PRODUZIONE
========================================================= */

(async () => {

  /* ================= SAFE SUPABASE ================= */

  async function waitForSupabase(retries = 20) {
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

  let supabase;
  try {
    supabase = await waitForSupabase();
  } catch (err) {
    console.error('[ESPLORA] Supabase non pronto', err);
    return;
  }

  /* ================= DOM ================= */

  const statusBox  = document.getElementById('explore-status');
  const poemsList = document.getElementById('explore-poems-list');
  const emptyBox  = document.getElementById('explore-empty');

  if (!statusBox || !poemsList || !emptyBox) {
    console.warn('[ESPLORA] DOM incompleto, abort');
    return;
  }

  /* ================= STATUS ================= */

  function setStatus(text) {
    statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
    statusBox.classList.remove('hidden');
  }

  function clearStatus() {
    statusBox.classList.add('hidden');
    statusBox.innerHTML = '';
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
    poemsList.innerHTML = '';

    poems.forEach(poem => {
      const poemId = poem.poem_id ?? poem.id;

      if (!poemId) return;

      const li = document.createElement('li');
      li.className = 'ai-poem-card';
      li.style.cursor = 'pointer';

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

      /* 👉 COLLEGAMENTO ALLA PAGINA ANALISI */
      li.addEventListener('click', () => {
        window.location.href = `poesia-focus.html?id=${poemId}`;
      });

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
        emptyBox.classList.remove('hidden');
        return;
      }

      emptyBox.classList.add('hidden');

      /* Mostriamo solo le prime N (UX discovery) */
      renderPoems(data.slice(0, 12));

    } catch (err) {
      console.error('[ESPLORA ERROR]', err);
      setStatus('❌ Errore nel caricamento delle poesie consigliate.');
    }
  }

  /* ================= INIT ================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExplore);
  } else {
    loadExplore();
  }

})();
