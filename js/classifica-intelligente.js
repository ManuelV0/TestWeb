// ===============================
// CONFIG SUPABASE
// ===============================
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q'

// ❗ Usa SUPABASE VIA CDN (già caricato nel sito principale)
const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// ===============================
// ELEMENTI DOM
// ===============================
const listEl = document.getElementById('ai-poems-list')
const statusEl = document.getElementById('ai-status')
const emptyEl = document.getElementById('ai-empty-state')

// ===============================
// CARICAMENTO CLASSIFICA
// ===============================
async function loadClassificaIntelligente() {
  try {
    // 1️⃣ sessione utente
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Utente non autenticato')
    }

    // 2️⃣ chiamata EDGE FUNCTION (PATH CORRETTO)
    const response = await fetch(
      'https://djikypgmchywybjxbwar.supabase.co/functions/v1/quick-api?limit=20',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Edge Function error: ${response.status}`)
    }

    const result = await response.json()

    // 3️⃣ rendering
    if (!result || !Array.isArray(result.results) || result.results.length === 0) {
      showEmptyState()
      return
    }

    renderPoems(result.results)

  } catch (err) {
    console.error('[CLASSIFICA INTELLIGENTE]', err)
    showEmptyState()
  } finally {
    statusEl.classList.add('hidden')
  }
}

// ===============================
// RENDER POESIE
// ===============================
function renderPoems(poems) {
  listEl.innerHTML = poems.map(poem => `
    <li class="ci-card">
      <h3 class="ci-title">${poem.title}</h3>
      <p class="ci-author">di ${poem.author_name}</p>

      <div class="ci-content">
        ${escapeHtml(poem.content.slice(0, 280))}
        ${poem.content.length > 280 ? '…' : ''}
      </div>

      <div class="ci-score">
        Affinità IA:
        <strong>${Number(poem.intelligent_score).toFixed(2)}</strong>
      </div>
    </li>
  `).join('')

  listEl.classList.remove('hidden')
}

// ===============================
// EMPTY STATE
// ===============================
function showEmptyState() {
  emptyEl.classList.remove('hidden')
}

// ===============================
// SICUREZZA BASE HTML
// ===============================
function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', loadClassificaIntelligente)
