/* =========================================================
   ANALISI-FOCUS – GPT LIVE + SBLOCCO SOFT
   Stato: PRODUZIONE / TEST UTENTE
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
  } catch {
    console.error('[ANALISI] Supabase non pronto');
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

  if (!terminal || !runBtn || !statusLabel) return;

  /* ================= STATO ================= */

  let isRunning = false;

  /* ================= UTILS ================= */

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function print(text, delay = 200) {
    terminal.appendChild(document.createTextNode(text));
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

  function getUnlockKey() {
    const id = getPoemId();
    return id ? `analysis_unlocked_${id}` : null;
  }

  const isUnlocked = () => {
    const key = getUnlockKey();
    return key && localStorage.getItem(key) === 'true';
  };

  const unlock = () => {
    const key = getUnlockKey();
    if (key) localStorage.setItem(key, 'true');
  };

  /* ================= LOAD POESIA ================= */

  async function loadPoem() {
    const poemId = getPoemId();

    if (!poemId || !/^\d+$/.test(poemId)) {
      setStatus('❌ ID poesia non valido.');
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
      console.error('[ANALISI] Errore poesia', err);
      setStatus('❌ Errore nel caricamento della poesia.');
    }
  }

  /* ================= UNLOCK PROMPT ================= */

  async function showUnlockPrompt() {
    if (document.querySelector('.unlock-actions')) return;

    isRunning = true;
    runBtn.disabled = true;

    terminal.textContent = '';
    statusLabel.textContent = '🔒 Inattiva';

    await print('$ tip analyze poem --profile\n');
    await print('→ Questa analisi richiede attenzione\n');
    await print('→ Vuoi davvero approfondire questa poesia?\n\n');

    const actions = document.createElement('div');
    actions.className = 'unlock-actions';

    const yes = document.createElement('button');
    yes.className = 'terminal-btn';
    yes.textContent = 'Approfondisci';

    const later = document.createElement('button');
    later.className = 'terminal-btn secondary';
    later.textContent = 'Più tardi';

    yes.onclick = async () => {
      unlock();
      actions.remove();
      await runGptAnalysis();
    };

    later.onclick = () => {
      terminal.appendChild(
        document.createTextNode('\n→ Analisi rimandata\n')
      );
      statusLabel.textContent = '⏸ Sospesa';
      actions.remove();
      isRunning = false;
      runBtn.disabled = false;
    };

    actions.append(yes, later);
    terminal.parentNode.appendChild(actions);
  }

  /* ================= GPT LIVE ================= */

  async function runGptAnalysis() {
    if (isRunning) return;

    isRunning = true;
    runBtn.disabled = true;

    terminal.textContent = '';
    statusLabel.textContent = '🧠 Analisi in corso';

    try {
      await print('$ tip analyze poem --profile\n');
      await print('[ OK ] Profilo lettore caricato\n');
      await print('[ OK ] Invio poesia al motore semantico\n\n');

      const poemText = contentEl.textContent;

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        await print('[ ERRORE ] Sessione scaduta. Ricarica la pagina.\n');
        statusLabel.textContent = '❌ Sessione';
        return;
      }

      const res = await fetch(
        'https://djikypgmchywybjxbwar.supabase.co/functions/v1/smart-handler',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            poem: { content: poemText }
          })
        }
      );

      if (!res.ok) throw new Error('EDGE_FUNCTION_ERROR');

      const result = await res.json();

      await print('[ OK ] Analisi completata\n\n', 400);
      await print(result.output + '\n', 80);

      statusLabel.textContent = '🔓 Attiva';

    } catch (err) {
      console.error('[GPT ERROR]', err);
      await print('\n[ ERRORE ] Analisi fallita\n');
      statusLabel.textContent = '❌ Errore';
    } finally {
      isRunning = false;
      runBtn.disabled = false;
    }
  }

  /* ================= ENTRY POINT ================= */

  async function handleRun() {
    if (isRunning) return;

    if (!isUnlocked()) {
      await showUnlockPrompt();
    } else {
      await runGptAnalysis();
    }
  }

  /* ================= INIT ================= */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPoem);
  } else {
    loadPoem();
  }

  runBtn.addEventListener('click', handleRun);

})();