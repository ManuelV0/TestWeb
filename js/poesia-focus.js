/* =========================================================
   ANALISI-FOCUS – CORE DEFINITIVO (GPT LIVE)
   Stato: PRODUZIONE STABILE – NO BUILD, NO VITE
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
    console.error('[ANALISI-FOCUS] Supabase non pronto', err);
    return;
  }

  /* ================= CONFIG GLOBAL ================= */

  if (!window.SUPABASE_ANON_KEY || !window.EDGE_FUNCTION_URL) {
    console.error('[ANALISI-FOCUS] Variabili globali mancanti');
    return;
  }

  /* ================= DOM ================= */

  const statusBox   = document.getElementById('focus-status');
  const poemBox     = document.getElementById('poem-container');

  const titleEl     = document.getElementById('poem-title');
  const authorEl    = document.getElementById('poem-author');
  const contentEl   = document.getElementById('poem-content');

  const terminal    = document.getElementById('gpt-terminal');
  const runBtn      = document.getElementById('run-analysis');
  const statusLabel = document.getElementById('terminal-status');

  if (!terminal || !runBtn || !statusLabel) {
    console.warn('[ANALISI-FOCUS] DOM incompleto, abort');
    return;
  }

  /* ================= UTILS ================= */

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  function setStatus(text) {
    if (!statusBox) return;
    statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
    statusBox.classList.remove('hidden');
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.classList.add('hidden');
  }

  async function print(text, delay = 160) {
    terminal.textContent += text;
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(delay);
  }

  function getPoemIdFromUrl() {
    return new URLSearchParams(window.location.search).get('id');
  }

  /* ================= LOAD POESIA ================= */

  async function loadPoem() {
    const poemId = getPoemIdFromUrl();

    if (!poemId || !/^\d+$/.test(poemId)) {
      setStatus('❌ Poesia non trovata.');
      return;
    }

    try {
      setStatus('Caricamento poesia…');

      const { data, error } = await supabase
        .from('poesie')
        .select('title, author_name, content')
        .eq('id', poemId)
        .single();

      if (error) throw error;

      titleEl.textContent   = data.title;
      authorEl.textContent  = `di ${data.author_name}`;
      contentEl.textContent = data.content;

      poemBox.classList.remove('hidden');
      clearStatus();

    } catch (err) {
      console.error('[ANALISI-FOCUS] Errore caricamento poesia', err);
      setStatus('❌ Errore nel caricamento della poesia.');
    }
  }

  /* ================= GPT ANALYSIS ================= */

  async function runAnalysis() {
    terminal.textContent = '';
    statusLabel.textContent = '🧠 Analisi in corso';
    runBtn.disabled = true;

    try {
      await print('$ tip analyze poem --profile\n');
      await print('[ OK ] Profilo lettore caricato\n');
      await print('[ OK ] Invio poesia al motore semantico\n\n');

      const res = await fetch(window.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`,
          'apikey': window.SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          poem: { content: contentEl.textContent }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const result = await res.json();

      await print('[ OK ] Analisi completata\n\n', 400);
      await print(result.output + '\n', 120);

      statusLabel.textContent = '✅ Analisi completata';

    } catch (err) {
      console.error('[GPT ANALYSIS ERROR]', err);
      await print('\n[ ERRORE ] Analisi fallita\n');
      statusLabel.textContent = '❌ Errore';
    } finally {
      runBtn.disabled = false;
    }
  }

  /* ================= INIT ================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPoem);
  } else {
    loadPoem();
  }

  runBtn.addEventListener('click', runAnalysis);

})();
