/* =========================================================
   ANALISI-FOCUS – CORE DEFINITIVO (GPT LIVE)
   Stato: PRODUZIONE STABILE – NO BUILD
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

  /* ================= CONFIG ================= */

  if (!window.SUPABASE_ANON_KEY || !window.EDGE_FUNCTION_URL) {
    console.error('[ANALISI-FOCUS] Config globale mancante');
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

  if (!terminal || !runBtn || !statusLabel || !contentEl) {
    console.warn('[ANALISI-FOCUS] DOM incompleto');
    return;
  }

  /* ================= UTILS ================= */

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function print(text, delay = 140) {
    terminal.textContent += text;
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(delay);
  }

  function setStatus(text) {
    if (!statusBox) return;
    statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
    statusBox.classList.remove('hidden');
  }

  function clearStatus() {
    if (!statusBox) return;
    statusBox.classList.add('hidden');
  }

  function getPoemId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  /* ================= LOAD POESIA ================= */

  async function loadPoem() {
    const poemId = getPoemId();

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
      console.error('[ANALISI-FOCUS] Errore poesia', err);
      setStatus('❌ Errore nel caricamento.');
    }
  }

  /* ================= GPT ANALYSIS ================= */

  async function runAnalysis() {
    if (!contentEl.textContent.trim()) {
      alert('La poesia non è ancora pronta.');
      return;
    }

    console.log('[ANALISI] Avvio analisi');

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

      if (!res.ok) throw new Error(await res.text());

      const result = await res.json();

      await print('[ OK ] Analisi completata\n\n', 300);
      await print(result.output + '\n', 80);

      statusLabel.textContent = '✅ Analisi completata';

    } catch (err) {
      console.error('[GPT ERROR]', err);
      await print('\n[ ERRORE ] Analisi fallita\n');
      statusLabel.textContent = '❌ Errore';
    } finally {
      runBtn.disabled = false;
    }
  }

  /* ================= INIT ================= */

  document.addEventListener('DOMContentLoaded', loadPoem);
  runBtn.addEventListener('click', runAnalysis);

})();
