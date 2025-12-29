
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ===============================
// CONFIGURAZIONE SUPABASE
// ===============================
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q'

// ✅ client corretto (NO window.supabase)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ===============================
// DOM
// ===============================
const listEl = document.getElementById('ai-poems-list')
const statusEl = document.getElementById('ai-status')
const emptyEl = document.getElementById('ai-empty-state')

// ===============================
document.addEventListener('DOMContentLoaded', loadClassificaIntelligente)

// ===============================
// CORE
// ===============================
async function loadClassificaIntelligente() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('Utente non autenticato')
    }

    const res = await fetch(
      'https://djikypgmchywybjxbwar.supabase.co/functions/v1/quick-api?limit=20',
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    )

    if (!res.ok) {
      throw new Error(`Errore Edge Function (${res.status})`)
    }

    const json = await res.json()

    if (!json.results || json.results.length === 0) {
      showEmpty()
      return
    }

    render(json.results)

  } catch (err) {
    console.error('[CLASSIFICA INTELLIGENTE]', err)
    showEmpty()
  } finally {
    statusEl.classList.add('hidden')
  }
}

// ===============================
// RENDER CLASSIFICA
// ===============================
function render(items) {
  // ✅ Ordina per affinità IA (decrescente)
  const sorted = [...items].sort((a, b) => {
    const scoreA = typeof a.intelligent_score === 'number' ? a.intelligent_score : 0
    const scoreB = typeof b.intelligent_score === 'number' ? b.intelligent_score : 0
    return scoreB - scoreA
  })

  listEl.innerHTML = sorted.map((p, index) => `
    <li class="ci-card">
      <div class="ci-rank">#${index + 1}</div>

      <h3 class="ci-title">
        ${p.title ?? 'Senza titolo'}
      </h3>

      <p class="ci-author">
        di ${p.author_name ?? 'Anonimo'}
      </p>

      <p class="ci-content">
        ${(p.content ?? '').slice(0, 280)}${p.content?.length > 280 ? '…' : ''}
      </p>

      <div class="ci-score">
        Affinità IA:
        <strong>
          ${
            typeof p.intelligent_score === 'number'
              ? p.intelligent_score.toFixed(2)
              : '—'
          }
        </strong>
      </div>
    </li>
  `).join('')

  listEl.classList.remove('hidden')
}

// ===============================
// EMPTY STATE
// ===============================
function showEmpty() {
  emptyEl.classList.remove('hidden')
  listEl.classList.add('hidden')
}
