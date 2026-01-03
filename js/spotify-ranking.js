const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
  'Maggio', 'Giugno', 'Luglio', 'Agosto',
  'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

function monthLabel(mese, anno) {
  return `${MONTHS_IT[mese - 1]} ${anno}`;
}

/* ================================
   LOAD DATA
================================ */
async function loadSpotifyRanking() {
  const { data, error } = await supabaseClient
    .from('monthly_top10')
    .select(`
      anno,
      mese,
      posizione,
      titolo_snapshot,
      autore_snapshot,
      audio_url,
      audio_voice_name,
      spotify_episode_url,
      spotify_published,
      punteggio_totale,
      numero_voti
    `)
    .order('anno', { ascending: false })
    .order('mese', { ascending: false })
    .order('posizione', { ascending: true });

  if (error) {
    console.error('Errore Spotify ranking:', error);
    return;
  }

  const grouped = groupByMonth(data);
  renderIndex(grouped);
  renderContent(grouped);
}

/* ================================
   GROUP BY MONTH
================================ */
function groupByMonth(rows) {
  return rows.reduce((acc, row) => {
    const key = `${row.anno}-${row.mese}`;

    if (!acc[key]) {
      acc[key] = {
        anno: row.anno,
        mese: row.mese,
        poems: []
      };
    }

    acc[key].poems.push(row);
    return acc;
  }, {});
}

/* ================================
   INDEX (MONTH / YEAR)
================================ */
function renderIndex(grouped) {
  const container = document.getElementById('spotify-ranking-index');
  container.innerHTML = '';

  Object.values(grouped).forEach(group => {
    const anchor = `month-${group.anno}-${group.mese}`;

    const link = document.createElement('a');
    link.href = `#${anchor}`;
    link.className = 'spotify-month-link';
    link.textContent = monthLabel(group.mese, group.anno);

    container.appendChild(link);
  });
}

/* ================================
   CONTENT
================================ */
function renderContent(grouped) {
  const container = document.getElementById('spotify-ranking-content');
  container.innerHTML = '';

  Object.values(grouped).forEach(group => {
    const section = document.createElement('section');
    section.className = 'spotify-month-block';
    section.id = `month-${group.anno}-${group.mese}`;

    section.innerHTML = `
      <div class="spotify-month-header">
        <h3>${monthLabel(group.mese, group.anno)}</h3>
        <a
          href="https://open.spotify.com/show/TUO_SHOW_ID"
          target="_blank"
          class="spotify-podcast-link"
        >
          Vai al podcast →
        </a>
      </div>

      <div class="spotify-top10-list">
        ${group.poems.map(renderPoemItem).join('')}
      </div>
    `;

    container.appendChild(section);
  });
}

/* ================================
   ITEM
================================ */
function renderPoemItem(poem) {
  const rankEmoji = ['🥇', '🥈', '🥉'][poem.posizione - 1] || `#${poem.posizione}`;

  let action = `<span class="spotify-listen-btn disabled">In lavorazione</span>`;

  if (poem.spotify_published && poem.spotify_episode_url) {
    action = `
      <a
        href="${poem.spotify_episode_url}"
        target="_blank"
        class="spotify-listen-btn"
      >
        Spotify
      </a>
    `;
  } else if (poem.audio_url) {
    action = `
      <audio controls preload="none" src="${poem.audio_url}"></audio>
    `;
  }

  return `
    <div class="spotify-poem-item">
      <div class="spotify-rank">${rankEmoji}</div>

      <div class="spotify-info">
        <div class="spotify-title">${poem.titolo_snapshot}</div>
        <div class="spotify-author">di ${poem.autore_snapshot}</div>
      </div>

      <div class="spotify-actions">
        ${action}
      </div>
    </div>
  `;
}

/* ================================
   INIT
================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadSpotifyRanking();
});
