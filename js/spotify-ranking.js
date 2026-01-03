// js/spotify-ranking.js

(function () {
  function initSpotifyRanking(data) {
    const contentEl = document.getElementById('spotify-ranking-content');
    const yearSelect = document.getElementById('spotify-year-select');

    if (!contentEl || !yearSelect || !Array.isArray(data) || data.length === 0) {
      console.warn('[SpotifyRanking] Dati non validi o contenitori mancanti');
      return;
    }

    const byYear = {};

    data.forEach(item => {
      if (!item || !item.anno || !item.mese || !item.posizione) return;

      if (!byYear[item.anno]) {
        byYear[item.anno] = [];
      }
      byYear[item.anno].push(item);
    });

    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    if (years.length === 0) {
      contentEl.innerHTML = '<p>Nessuna classifica disponibile.</p>';
      return;
    }

    yearSelect.innerHTML = '';
    years.forEach(year => {
      const opt = document.createElement('option');
      opt.value = year;
      opt.textContent = year;
      yearSelect.appendChild(opt);
    });

    function renderYear(year) {
      contentEl.innerHTML = '';

      const yearData = byYear[year];
      if (!yearData) return;

      const byMonth = {};
      yearData.forEach(item => {
        if (!byMonth[item.mese]) byMonth[item.mese] = [];
        byMonth[item.mese].push(item);
      });

      Object.keys(byMonth)
        .map(Number)
        .sort((a, b) => b - a)
        .forEach(mese => {
          const block = document.createElement('div');
          block.className = 'spotify-month-block';

          block.innerHTML = `
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

          contentEl.appendChild(block);
        });
    }

    yearSelect.addEventListener('change', e => {
      renderYear(Number(e.target.value));
    });

    renderYear(years[0]);
  }

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

    const label = item.spotify_published
      ? 'Ascolta su Spotify'
      : 'Ascolta audio';

    return `
      <div class="spotify-episode">
        <div class="spotify-rank">${rankEmoji}</div>
        <div class="spotify-episode-info">
          <div class="spotify-episode-title">${escapeHTML(item.titolo)}</div>
          <div class="spotify-episode-author">${escapeHTML(item.autore)}</div>
        </div>
        <a href="${listenUrl}" target="_blank" class="spotify-play-btn">
          ${label}
        </a>
      </div>
    `;
  }

  function getMonthName(mese) {
    return [
      'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
      'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
    ][mese - 1] || '';
  }

  function escapeHTML(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 🔑 ESPONIAMO GLOBALMENTE
  window.initSpotifyRanking = initSpotifyRanking;
})();
