/* =========================================================
   ESPLORA / POESIE CONSIGLIATE – VERSIONE DEFINITIVA
   Modalità: DISCOVER (non classifica)
   Stato: PRODUZIONE
========================================================= */

(async () => {

  /* ================= SAFE SUPABASE ================= */

  async function waitForSupabase(retries = 20) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (window.supabaseClient) resolve(window.supabaseClient);
        else if (retries <= 0) reject(new Error('SUPABASE_NOT_READY'));
        else setTimeout(() => check(--retries), 100);
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
      setStatus('Accedi per scoprire poesie consigliate ✨');
      throw new Error('NOT_AUTHENTICATED');
    }
    return data.session.user.id;
  }

  /* ================= RENDER ================= */

  function renderPoems(poems) {
    poemsList.innerHTML = '';

    poems.forEach(poem => {
      const poemId = poem.id || poem.poem_id;
      if (!poemId) return;

      const li = document.createElement('li');
      li.className = 'ai-poem-card';
      li.style.cursor = 'pointer';

      const reasonLabel =
        poem.reason === 'affinity'
          ? `<span class="discover-reason affinity">🧠 In sintonia con ciò che leggi</span>`
          : `<span class="discover-reason explore">✨ Scoperta esplorativa</span>`;

      li.innerHTML = `
        <h3>${poem.title}</h3>
        <p class="author">di ${poem.author_name}</p>
        ${reasonLabel}
      `;

      /* 👉 CLICK → ANALISI POESIA */
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

      const userId = await requireAuth();

      /**
       * 🔮 DISCOVER
       * In futuro: user_top_themes dinamici
       * Ora: già compatibile con la funzione SQL
       */
      const { data, error } = await supabase.rpc('get_discover_poems', {
        p_user_id: userId,
        p_user_top_themes: [] // fallback sicuro
      });

      clearStatus();

      if (error) throw error;

      if (!data || data.length === 0) {
        emptyBox.classList.remove('hidden');
        emptyBox.innerHTML = `
          <p>
            Stiamo imparando i tuoi gusti.<br>
            Continua a leggere e votare ✨
          </p>
        `;
        return;
      }

      emptyBox.classList.add('hidden');
      renderPoems(data);

    } catch (err) {
      console.error('[ESPLORA ERROR]', err);
      setStatus('Errore nel caricamento delle poesie consigliate.');
    }
  }

  /* ================= INIT ================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadExplore);
  } else {
    loadExplore();
  }

})();
