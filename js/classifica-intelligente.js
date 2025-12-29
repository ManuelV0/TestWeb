// ===============================
// CLASSIFICA INTELLIGENTE – CORE
// ===============================

// ⚠️ IMPORTANTE:
// questa pagina PRESUPPONE che Supabase sia già caricato globalmente
// tramite <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q'

// ✅ crea client UNA SOLA VOLTA
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
// BOOT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  loadClassificaIntelligente()
})

// ===============================
// MAIN
// ===============================
async function loadClassificaIntelligente() {
  try {
    // ---- sessione utente
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session || !session.access_token) {
      throw new Error('Utente non autenticato')
    }

    // ---- chiamata Edge Function
    const res = await fetch(
      'https://djikypgmchywybjxbwar.supabase.co/functions/v1/quick-api?limit=20',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('[EDGE RAW RESPONSE]', text)
      throw new Error('Errore Edge Function')
    }

    const json = await res.json()

    if (!json.results || json.results.length === 0) {
      showEmptyState()
      return
    }

    renderList(json.results)

  } catch (err) {
    console.error('[CLASSIFICA INTELLIGENTE]', err)
    showEmptyState()
  } finally {
    statusEl.classList.add('hidden')
  }
}

// ===============================
// RENDER
// ===============================
function renderList(items) {
  listEl.innerHTML = items.map(poem => {
    const score =
      typeof poem.intelligent_score === 'number'
        ? poem.intelligent_score.toFixed(2)
        : '—'

    return `
      <li class="ci-card">
        <h3 class="ci-title">${poem.title ?? 'Senza titolo'}</h3>
        <p class="ci-author">di ${poem.author_name ?? 'Anonimo'}</p>
        <p class="ci-content">
          ${(poem.content ?? '').slice(0, 280)}
          ${(poem.content && poem.content.length > 280) ? '…' : ''}
        </p>
        <div class="ci-score">
          Affinità IA: <strong>${score}</strong>
        </div>
      </li>
    `
  }).join('')

  listEl.classList.remove('hidden')
}

// ===============================
// EMPTY STATE
// ===============================
function showEmptyState() {
  emptyEl.classList.remove('hidden')
  listEl.classList.add('hidden')
}
