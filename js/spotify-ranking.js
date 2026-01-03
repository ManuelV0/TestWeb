/* ======================================================
   SPOTIFY RANKING – TOP 10 PODCAST (PRODUZIONE)
====================================================== */

document.addEventListener('DOMContentLoaded', () => {
  loadSpotifyRanking();
});

/* ======================================================
   CARICAMENTO DATI
   (qui potrai sostituire fetch con Supabase RPC)
====================================================== */

async function loadSpotifyRanking() {
  try {
    // 👉 TEMP: dati mock (SOSTITUIRE con fetch / Supabase)
    const data = await getMockSpotifyRanking();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('Spotify ranking vuoto');
      return;
    }

    initSpotifyRanking(data);
  } catch (err) {
    console.error('Errore caricamento Spotify ranking:', err);
  }
}

/* ======================================================
   INIZIALIZZAZIONE CLASSIFICA
====================================================== */

function initSpotifyRanking(data) {
  const contentEl = document.getElementById('spotify-ranking-content');
  const yearSelect = document.getElementById('spotify-year-select');

  if (!contentEl || !yearSelect) {
    console.warn('Elementi DOM Spotify mancanti');
    return;
  }

  /* ================================
     RAGGRUPPA PER ANNO
  ================================ */

  const byYear = {};

  data.forEach(item => {
    if (!byYear[item.anno]) {
      byYear[item.anno] = [];
    }
    byYear[item.anno].push(item);
  });

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  /* ================================
     POPOLA SELECT ANNO
  ================================ */

  yearSelect.innerHTML = '';

  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  /* ================================
     RENDER ANNO
  ================================ */

  function renderYear(year) {
    contentEl.innerHTML = '';

    const yearData = byYear[year];
    if (!yearData) return;

    // Raggruppa per mese
    const byMonth = {};

    yearData.forEach(item => {
      if (!byMonth[item.mese]) {
        byMonth[item.mese] = [];
      }
      byMonth[item.mese].push(item);
    });

    Object.keys(byMonth)
      .map(Number)
      .sort((a, b) => b - a)
      .forEach(mese => {
        const monthBlock = document.createElement('div');
        monthBlock.className = 'spotify-month-block';

        monthBlock.innerHTML = `
          <div class="spotify-period">
            <span class="spotify-month">${getMonthName(mese)}</span>
            <span class="spotify-year">${year}</span>
          </div>

          <div class="spotify-episodes">
            ${byMonth[mese]
              .sort((a, b) => a.posizione - b.posizione)
              .slice(0, 10)
              .map(renderSpotifyEpisode)
              .join('')}
          </div>
        `;

        contentEl.appendChild(monthBlock);
      });
  }

  /* ================================
     EVENTO SELECT
  ================================ */

  yearSelect.addEventListener('change', e => {
    renderYear(Number(e.target.value));
  });

  /* ================================
     DEFAULT: ANNO PIÙ RECENTE
  ================================ */

  yearSelect.value = years[0];
  renderYear(years[0]);
}

/* ======================================================
   RENDER EPISODIO
====================================================== */

function renderSpotifyEpisode(item) {
  const rankEmoji =
    item.posizione === 1 ? '🥇' :
    item.posizione === 2 ? '🥈' :
    item.posizione === 3 ? '🥉' :
    `#${item.posizione}`;

  const listenUrl =
    item.spotify_published && item.spotify_episode_url
      ? item.spotify_episode_url
      : item.audio_url;

  const listenLabel =
    item.spotify_published
      ? 'Ascolta su Spotify'
      : 'Ascolta audio';

  return `
    <div class="spotify-episode">
      <div class="spotify-rank">${rankEmoji}</div>

      <div class="spotify-episode-info">
        <div class="spotify-episode-title">${escapeHTML(item.titolo)}</div>
        <div class="spotify-episode-author">${escapeHTML(item.autore)}</div>
      </div>

      <a
        href="${listenUrl}"
        target="_blank"
        rel="noopener noreferrer"
        class="spotify-play-btn"
      >
        ${listenLabel}
      </a>
    </div>
  `;
}

/* ======================================================
   UTILS
====================================================== */

function getMonthName(mese) {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
    'Maggio', 'Giugno', 'Luglio', 'Agosto',
    'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[mese - 1] || '';
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ======================================================
   MOCK DATA (TEMPORANEO – RIMUOVERE IN PROD)
====================================================== */

async function getMockSpotifyRanking() {
  return [
    {
      anno: 2026,
      mese: 1,
      posizione: 1,
      titolo: 'BENVENUTO',
      autore: 'Anonimo',
      audio_url: "https://djikypgmchywybjxbwar.supabase.co/storage/v1/object/public/poetry-audio/poesia-44-1767398131548.mp3"
      spotify_episode_url: null,
      spotify_published: false
    }
  ];
}
