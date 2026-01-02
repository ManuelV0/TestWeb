/* =========================================================
   ANALISI-FOCUS – CORE DEFINITIVO
   Stato: STABILE / SENZA SBLOCCO / SENZA GPT LIVE
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
    console.error('[ANALISI-FOCUS] Supabase non pronto');
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

  /* ================= HELPERS ================= */

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

  async function print(text, delay = 250) {
    terminal.textContent += text;
    terminal.scrollTop = terminal.scrollHeight;
    await sleep(delay);
  }

  function getPoemIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /* ================= LOAD POESIA ================= */

  async function loadPoem() {
    const poemId = getPoemIdFromUrl();
    if (!poemId) {
      setStatus('❌ Poesia non trovata.');
      return;
    }

    try {
      setStatus('Caricamento poesia…');

      const { data, error } = await supabase
        .from('poesie')
        .select('id, title, author_name, content')
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
      setStatus('❌ Errore nel caricamento della poesia.');
    }
  }

  /* ================= ANALISI IA (SIMULATA MA STRUTTURATA) ================= */

  async function runAnalysis() {
    if (!terminal) return;

    terminal.textContent = '';
    statusLabel.textContent = '🧠 Analisi in corso';

    runBtn.disabled = true;

    await print('$ tip analyze poem --profile\n');
    await print('[ OK ] Profilo lettore caricato\n');
    await print('[ OK ] Storico interazioni analizzato\n');
    await print('[ OK ] Parsing semantico poesia\n\n');

    await print('→ Temi dominanti:\n');
    await print('  • Identità (alto)\n');
    await print('  • Memoria (alto)\n');
    await print('  • Dissoluzione (medio)\n\n');

    await print('→ Affinità con il tuo profilo:\n');
    await print('  • Pattern emotivi ricorrenti\n');
    await print('  • Linguaggio affine ai testi apprezzati\n\n');

    await print('→ Lettura guidata:\n');
    await print('  Questa poesia funziona per sottrazione,\n');
    await print('  lasciando spazio alla tua interpretazione.\n\n');

    await print('[ COMPLETATO ]\n');

    statusLabel.textContent = '✅ Analisi completata';
    runBtn.disabled = false;
  }

  /* ================= INIT ================= */

  document.addEventListener('DOMContentLoaded', loadPoem);

  if (runBtn) {
    runBtn.addEventListener('click', runAnalysis);
  }

})();