
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ===============================
// CONFIG
// ===============================
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

// ✅ CLIENT LOCALE, NESSUN window.supabase
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// ===============================
// DOM
// ===============================
const listEl = document.getElementById('ai-poems-list')
const statusEl = document.getElementById('ai-status')
const emptyEl = document.getElementById('ai-empty-state')

// ===============================
async function loadClassificaIntelligente() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) throw new Error('Utente non autenticato')

    const res = await fetch(
      'https://djikypgmchywybjxbwar.supabase.co/functions/v1/quick-api?limit=20',
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    )

    if (!res.ok) throw new Error('Errore Edge')

    const json = await res.json()

    if (!json.results || json.results.length === 0) {
      emptyEl.classList.remove('hidden')
      return
    }

    listEl.innerHTML = json.results.map(poem => `
      <li class="ci-card">
        <h3>${poem.title}</h3>
        <p>di ${poem.author_name}</p>
        <p>${poem.content.slice(0, 280)}…</p>
        <small>Affinità IA: ${poem.intelligent_score.toFixed(2)}</small>
      </li>
    `).join('')

  } catch (err) {
    console.error('[CLASSIFICA INTELLIGENTE]', err)
    emptyEl.classList.remove('hidden')
  } finally {
    statusEl.classList.add('hidden')
  }
}

document.addEventListener('DOMContentLoaded', loadClassificaIntelligente)
