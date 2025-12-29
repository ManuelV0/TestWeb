const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co'
const SUPABASE_ANON_KEY = 'TUO_ANON_KEY'

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

const listEl = document.getElementById('ci-list')
const loadingEl = document.getElementById('ci-loading')
const errorEl = document.getElementById('ci-error')

async function loadClassificaIntelligente() {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw new Error('Utente non autenticato')
    }

    const res = await fetch(
      'https://djikypgmchywybjxbwar.supabase.co/functions/v1/classifica-intelligente?limit=20',
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    )

    if (!res.ok) throw new Error('Errore Edge')

    const json = await res.json()

    renderList(json.results)
  } catch (err) {
    console.error(err)
    errorEl.classList.remove('hidden')
  } finally {
    loadingEl.classList.add('hidden')
  }
}

function renderList(items) {
  if (!items || items.length === 0) {
    listEl.innerHTML = '<p>Nessuna poesia trovata.</p>'
    listEl.classList.remove('hidden')
    return
  }

  listEl.innerHTML = items.map(poem => `
    <article class="ci-card">
      <div class="ci-title">${poem.title}</div>
      <div class="ci-author">di ${poem.author_name}</div>
      <div class="ci-content">
        ${poem.content.slice(0, 300)}${poem.content.length > 300 ? '…' : ''}
      </div>
      <div class="ci-score">
        Affinità: ${poem.intelligent_score.toFixed(2)}
      </div>
    </article>
  `).join('')

  listEl.classList.remove('hidden')
}

document.addEventListener('DOMContentLoaded', loadClassificaIntelligente)
