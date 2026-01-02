/* =========================================================
   ANALISI FOCUS – CORE DEFINITIVO (ANTI-FAIL)
   Stato: PRODUZIONE STABILE
========================================================= */

(async () => {

  /* ================= SAFE SUPABASE ================= */

  async function waitForSupabase(retries = 20) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (window.supabaseClient) resolve(window.supabaseClient);
        else if (retries <= 0) reject();
        else setTimeout(() => check(--retries), 100);
      };
      check();
    });
  }

  let supabase;
  try {
    supabase = await waitForSupabase();
  } catch {
    console.error('[ANALISI-FOCUS] Supabase non pronto');
    return;
  }

  if (!window.SUPABASE_ANON_KEY || !window.EDGE_FUNCTION_URL) {
    console.error('[ANALISI-FOCUS] Config globale mancante');
    return;
  }

  /* ================= DOM ================= */

  const poemBox       = document.getElementById('poem-container');
  const titleEl       = document.getElementById('poem-title');
  const authorEl      = document.getElementById('poem-author');
  const contentEl     = document.getElementById('poem-content');

  const runBtn        = document.getElementById('run-analysis');
  const analysisBox   = document.getElementById('analysis-section');
  const terminal      = document.getElementById('gpt-terminal');
  const statusLabel   = document.getElementById('terminal-status');

  if (!runBtn || !terminal || !analysisBox) {
    console.error('[ANALISI-FOCUS] DOM incompleto');
    return;
  }

  /* ================= UTILS ================= */

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function print(text, delay = 120) {
    terminal.textContent += text;
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(delay);
  }

  function getPoemId() {
    return new URLSearchParams(window.location.search).get('id');
  }

  /* ================= LOAD POESIA ================= */

  async function loadPoem() {
    const poemId = getPoemId();
    if (!poemId) return;

    const { data } = await supabase
      .from('poesie')
      .select('title, author_name, content')
      .eq('id', poemId)
      .single();

    if (!data) return;

    titleEl.textContent  = data.title;
    authorEl.textContent = `di ${data.author_name}`;
    contentEl.textContent = data.content;

    poemBox.classList.remove('hidden');
  }

  /* ================= GPT ANALYSIS ================= */

  async function runAnalysis() {
    console.log('[ANALISI-FOCUS] Avvio analisi');

    analysisBox.classList.remove('hidden');
    terminal.textContent = '';
    statusLabel.textContent = '🧠 Analisi in corso…';
    runBtn.disabled = true;

    try {
      await print('$ tip analyze poem --profile\n');
      await print('[ OK ] Profilo lettore caricato\n');
      await print('[ OK ] Connessione motore semantico\n\n');

      const res = await fetch(window.EDGE_FUNCTION_URL, {
        method: 'POST',
        mode: 'cors',                 // 🔥 FONDAMENTALE
        credentials: 'omit',          // 🔥 EVITA BLOCCO
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
        const t = await res.text();
        throw new Error(t);
      }

      const json = await res.json();

      await print('[ OK ] Analisi completata\n\n', 300);
      await print(json.output + '\n', 80);

      statusLabel.textContent = '✅ Analisi completata';

    } catch (err) {
      console.error('[GPT ANALYSIS ERROR]', err);

      // 🔥 FALLBACK VISIVO (mai schermo vuoto)
      await print('\n[ ⚠️ ] Analisi temporaneamente non disponibile\n');
      await print(
        'Il sistema sta aggiornando il motore IA.\n' +
        'Riprova tra poco.\n'
      );

      statusLabel.textContent = '⚠️ Non disponibile';
    } finally {
      runBtn.disabled = false;
    }
  }

  /* ================= INIT ================= */

  await loadPoem();

  runBtn.addEventListener('click', runAnalysis);

})();
