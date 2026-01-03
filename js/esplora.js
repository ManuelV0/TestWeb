/* =========================================
   SPOTIFY CLASSIFICA – PODCAST TOP 10
   Produzione ready 🚀
========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initSpotifyClassifica();
});

async function initSpotifyClassifica() {
  const indexEl = document.getElementById('spotify-ranking-index');
  const contentEl = document.getElementById('spotify-ranking-content');

  if (!indexEl || !contentEl) return;

  if (!window.supabaseClient) {
    console.error('❌ Supabase non inizializzato');
    return;
  }

  const supabase = window.supabaseClient;

  try {
    const { data, error } = await supabase
      .from('monthly_top10')
      .select(`
        anno,
        mese,
        posizione,
        titolo_snapshot,
        autore_snapshot,
        audio_url,
        spotify_episode_url,
        spotify_published
      `)
      .order('anno', { ascending: false })
      .order('mese', { ascending: false })
      .order('posizione', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) {
      contentEl.innerHTML = '<p>Nessuna classifica disponibile.</p>';
      return;
    }

    const grouped = groupByPeriodo(data);
    renderIndice(indexEl, grouped);
    renderClassifiche(contentEl, grouped);

  } catch (err) {
    console.error('Errore Spotify ranking:', err);
    contentEl.innerHTML = '<p>Errore nel caricamento della classifica.</p>';
  }
}

/* ================================
   UTILITIES
================================ */

function groupByPeriodo(rows) {
  return rows.reduce((acc, row) => {
    const key = `${row.anno}-${row.mese}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});
}

function meseLabel(mese) {
  return [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ][mese - 1];
}

/* ================================
   RENDER INDEX
================================ */

function renderIndice(container, grouped) {
  const keys = Object.keys(grouped);

  if (keys.length <= 1) return;

  container.innerHTML = `
    <div class="spotify-period">
      ${keys.map((key, i) => {
        const [anno, mese] = key.split('-');
        return `
          <a href="#spotify-${key}" class="spotify-period-link">
            <span class="spotify-month">${meseLabel(Number(mese))}</span>
            <span class="spotify-year">${anno}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

/* ================================
   RENDER CLASSIFICHE
================================ */

function renderClassifiche(container, grouped) {
  container.innerHTML = '';

  Object.entries(grouped).forEach(([key, poems]) => {
    const [anno, mese] = key.split('-');

    const episodesHTML = poems.map(poem => {
      const rankEmoji = ['🥇', '🥈', '🥉'][poem.posizione - 1] || `#${poem.posizione}`;
      const link = poem.spotify_published
        ? poem.spotify_episode_url
        : poem.audio_url;

      return `
        <div class="spotify-episode">
          <div class="spotify-rank">${rankEmoji}</div>

          <div class="spotify-episode-info">
            <div class="spotify-episode-title">${poem.titolo_snapshot}</div>
            <div class="spotify-episode-author">${poem.autore_snapshot}</div>
          </div>

          <a
            href="${link || '#'}"
            target="_blank"
            rel="noreferrer noopener"
            class="spotify-play-btn"
          >
            ▶ Ascolta
          </a>
        </div>
      `;
    }).join('');

    container.insertAdjacentHTML('beforeend', `
      <div id="spotify-${key}" class="spotify-month-block">
        <div class="spotify-period">
          <span class="spotify-month">${meseLabel(Number(mese))}</span>
          <span class="spotify-year">${anno}</span>
        </div>

        <div class="spotify-episodes">
          ${episodesHTML}
        </div>

        <div class="spotify-cta">
          <a
            href="https://open.spotify.com/show/YOUR_SHOW_ID"
            target="_blank"
            class="spotify-play-btn"
          >
            🎧 Vai al podcast
          </a>
        </div>
      </div>
    `);
  });
}
