/* =========================================================
   POESIA FOCUS – CORE
========================================================= */

async function waitForSupabase(retries = 15) {
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

const supabase = await waitForSupabase();

/* ================= DOM ================= */

const statusBox = document.getElementById('focus-status');
const poemContainer = document.getElementById('poem-container');
const aiSection = document.getElementById('ai-section');

const titleEl = document.getElementById('poem-title');
const authorEl = document.getElementById('poem-author');
const contentEl = document.getElementById('poem-content');

/* ================= HELPERS ================= */

function setStatus(text) {
  statusBox.innerHTML = `<p class="loading-text">${text}</p>`;
  statusBox.classList.remove('hidden');
}

function clearStatus() {
  statusBox.classList.add('hidden');
}

/* ================= CORE ================= */

function getPoemIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

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

    titleEl.textContent = data.title;
    authorEl.textContent = `di ${data.author_name}`;
    contentEl.textContent = data.content;

    poemContainer.classList.remove('hidden');
    aiSection.classList.remove('hidden');
    clearStatus();

  } catch (err) {
    console.error('[POESIA FOCUS ERROR]', err);
    setStatus('❌ Errore nel caricamento della poesia.');
  }
}

/* ================= GPT PLACEHOLDER ================= */
/* Qui collegherai GPT più avanti */

document.getElementById('ai-send-btn').addEventListener('click', () => {
  const input = document.getElementById('ai-input').value.trim();
  if (!input) return;

  const responseBox = document.getElementById('ai-response');
  responseBox.textContent =
    '✨ (Qui arriverà la risposta dell’IA — integrazione GPT in arrivo)';
});

/* ================= INIT ================= */

document.addEventListener('DOMContentLoaded', loadPoem);