/* =========================================================
   ANALISI-FOCUS – VERSIONE DEFINITIVA E STABILE
   NO BUILD – NO VITE – EVENTI SEMPRE ATTIVI
========================================================= */

console.log('[ANALISI-FOCUS] script caricato');

document.addEventListener('DOMContentLoaded', async () => {

  /* ================= DOM ================= */

  const statusBox   = document.getElementById('focus-status');
  const poemBox     = document.getElementById('poem-container');

  const titleEl     = document.getElementById('poem-title');
  const authorEl    = document.getElementById('poem-author');
  const contentEl   = document.getElementById('poem-content');

  const terminal    = document.getElementById('gpt-terminal');
  const runBtn      = document.getElementById('run-analysis');
  const statusLabel = document.getElementById('terminal-status');

  /* ================= VALIDAZIONE DOM ================= */

  if (!runBtn || !terminal) {
    console.error('[ANALISI-FOCUS] Bottone o terminale non trovati');
    return;
  }

  console.log('[ANALISI-FOCUS] DOM OK');

  /* ================= EVENT LISTENER (SUBITO) ================= */

  runBtn.addEventListener('click', () => {
    console.log('[ANALISI-FOCUS] CLICK intercettato');
    runAnalysis();
  });

  /* ================= CONFIG ================= */

  if (!window.SUPABASE_ANON_KEY || !window.EDGE_FUNCTION_URL) {
    console.error('[ANALISI-FOCUS] Config globale mancante');
  }

  /* ================= SUPABASE ================= */

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
    console.log('[ANALISI-FOCUS] Supabase pronto');
  } catch {
    console.warn('[ANALISI-FOCUS] Supabase non pronto');
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

    if (!poemId) {
      setStatus('❌ Poesia non trovata');
      return;
    }

    if (!supabase) {
      setStatus('❌ Sistema non pronto');
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

      console.log('[ANALISI-FOCUS] Poesia caricata');

    } catch (err) {
      console.error('[ANALISI-FOCUS] Errore poesia', err);
      setStatus('❌ Errore nel caricamento');
    }
  }

  /* ================= ANALISI GPT ================= */

  async function runAnalysis() {
    console.log('[ANALISI-FOCUS] Avvio analisi');

    if (!contentEl?.textContent) {
      alert('Testo poesia non disponibile');
      return;
    }

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
        const t = await res.text();
        throw new Error(t);
      }

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

  loadPoem();

});
