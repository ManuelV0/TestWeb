import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ================= CONFIG =================
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q'

// ================= SUPABASE CLIENT =================
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// ================= DOM =================
const listEl = document.getElementById('ai-poems-list')
const loadingEl = document.getElementById('ai-status')
const errorEl = document.getElementById('ai-empty-state')

// ================= CORE =================
async function loadClassificaIntelligente() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Utente non autenticato')
    }

    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/classifica-intelligente?limit=20`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    )

    if (!res.ok) {
      throw new Error('Errore Edge Function')
    }

    const json = await res.json()
    renderList(json.results)

  } catch (err) {
    console.error('[CLASSIFICA INTELLIGENTE]', err)
    errorEl.classList.remove('hidden')
  } finally {
    loadingEl.classList.add('hidden')
  }
}

// ================= RENDER =================
function renderList(items) {
  if (!items || items.length === 0) {
    listEl.innerHTML = '<li>Nessuna poesia trovata.</li>'
    return
  }

  listEl.innerHTML = items.map(poem => `
    <li class="ci-card">
      <h3 class="ci-title">${poem.title}</h3>
      <p class="ci-author">di ${poem.author_name}</p>
      <p class="ci-content">
        ${poem.content.slice(0, 280)}${poem.content.length > 280 ? '…' : ''}
      </p>
      <div class="ci-score">
        Affinità: ${Number(poem.intelligent_score).toFixed(2)}
      </div>
    </li>
  `).join('')
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', loadClassificaIntelligente)
