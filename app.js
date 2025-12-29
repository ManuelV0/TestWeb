// =======================================================
// 1. INIZIALIZZAZIONE SUPABASE
// =======================================================

const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// =======================================================
// 2. DOM READY
// =======================================================

document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // STATO
  // =====================================================
  let allPoems = [];
  let currentRating = 0;

  // =====================================================
  // SELETTORI
  // =====================================================
  const poemsListContainer = document.querySelector('.poems-list');
  const votingModal = document.getElementById('voting-modal');
  const closeVotingModalBtn = document.getElementById('close-voting-modal-btn');
  const starRatingContainer = document.querySelector('#voting-modal .star-rating');
  const submitVoteBtn = document.getElementById('submit-vote-btn');
  const votePoemIdInput = document.getElementById('vote-poem-id');
  const voteMessage = document.getElementById('vote-form-message');
  const searchInput = document.getElementById('search-poems');
  const monthlyPoemsListContainer = document.getElementById('monthly-poems-list');

  // =====================================================
  // RESET MODALE VOTO
  // =====================================================
  function resetVotingModal() {
    currentRating = 0;
    if (voteMessage) {
      voteMessage.textContent = '';
      voteMessage.style.color = '';
    }
    if (votePoemIdInput) votePoemIdInput.value = '';
    highlightStars(starRatingContainer, 0);
  }

  if (closeVotingModalBtn) {
    closeVotingModalBtn.addEventListener('click', () => {
      votingModal.classList.add('hidden');
      votingModal.removeAttribute('aria-modal');
      resetVotingModal();
    });
  }

  // =====================================================
  // APERTURA MODALE VOTO
  // =====================================================
  async function apriModaleVoto(poemId) {
    if (!poemId) return;

    if (document.cookie.includes(`voted-poem-${poemId}=true`)) {
      alert('Hai già votato questa poesia.');
      return;
    }

    try {
      const { data: poem, error } = await supabaseClient
        .from('poesie')
        .select('id,title,author_name')
        .eq('id', poemId)
        .single();

      if (error) throw error;

      document.getElementById('vote-poem-title').textContent = poem.title;
      document.getElementById('vote-poem-author').textContent =
        `di ${poem.author_name}`;
      votePoemIdInput.value = poem.id;

      resetVotingModal();
      votingModal.classList.remove('hidden');
      votingModal.setAttribute('aria-modal', 'true');
    } catch (err) {
      console.error('[OPEN VOTE ERROR]', err);
      alert('Errore nel caricamento della votazione.');
    }
  }

  // =====================================================
  // STELLE
  // =====================================================
  function highlightStars(container, rating) {
    if (!container) return;
    container.querySelectorAll('label.star i').forEach((icon, i) => {
      icon.classList.toggle('fa-solid', i < rating);
      icon.classList.toggle('fa-regular', i >= rating);
    });
  }

  if (starRatingContainer) {
    starRatingContainer
      .querySelectorAll('label.star')
      .forEach((label, index) => {
        label.addEventListener('click', () => {
          currentRating = index + 1;
          highlightStars(starRatingContainer, currentRating);
        });
      });
  }

  // =====================================================
  // INVIO VOTO
  // =====================================================
  if (submitVoteBtn) {
    submitVoteBtn.addEventListener('click', async () => {
      if (!currentRating) {
        voteMessage.textContent = 'Seleziona da 1 a 5 stelle.';
        voteMessage.style.color = 'red';
        return;
      }

      const poemId = Number(votePoemIdInput.value);

      try {
        const { error } = await supabaseClient.functions.invoke('invia-voto', {
          body: {
            poem_id: poemId,
            rating: currentRating
          }
        });

        if (error) throw error;

        document.cookie =
          `voted-poem-${poemId}=true; max-age=31536000; path=/`;

        voteMessage.textContent = 'Grazie per aver votato!';
        voteMessage.style.color = 'green';

        await caricaDatiIniziali();

        setTimeout(() => {
          votingModal.classList.add('hidden');
          votingModal.removeAttribute('aria-modal');
          resetVotingModal();
        }, 1500);

      } catch (err) {
        console.error('[VOTE ERROR]', err);
        voteMessage.textContent = 'Errore durante il voto.';
        voteMessage.style.color = 'red';
      }
    });
  }

  // =====================================================
  // RENDER CLASSIFICA
  // =====================================================
  function renderPoems() {
    if (!poemsListContainer) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = allPoems.filter(p =>
      !searchTerm ||
      (p.title || '').toLowerCase().includes(searchTerm) ||
      (p.author_name || '').toLowerCase().includes(searchTerm)
    );

    const topTen = [...filtered]
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      .slice(0, 10);

    poemsListContainer.innerHTML =
      topTen.length === 0
        ? '<p>Nessuna poesia disponibile.</p>'
        : topTen.map((p, i) => {
            const rank = ['🥇', '🥈', '🥉'][i] || '';
            return `
              <article class="poem-row" data-poem-id="${p.id}">
                <div class="poem-info">
                  <span class="poem-rank">${rank}</span>
                  <span class="poem-title">${p.title}</span>
                  <span class="poem-author">di ${p.author_name}</span>
                </div>
                <div class="poem-actions">
                  <span class="poem-votes">${p.vote_count || 0} Voti</span>
                  <button class="button-vote" data-poem-id="${p.id}">
                    Vota
                  </button>
                </div>
              </article>
            `;
          }).join('');

    attachPoemHandlers();
  }

  // =====================================================
  // HANDLER CLICK CLASSIFICA
  // =====================================================
  function attachPoemHandlers() {
    poemsListContainer.querySelectorAll('.poem-row').forEach(row => {
      const poemId = row.dataset.poemId;

      row.querySelector('.button-vote')?.addEventListener('click', e => {
        e.stopPropagation();
        apriModaleVoto(poemId);
      });
    });
  }

  // =====================================================
  // CARICAMENTO DATI
  // =====================================================
  async function caricaDatiIniziali() {
    try {
      const { data, error } =
        await supabaseClient.rpc('get_poems_with_votes');

      if (error) throw error;

      allPoems = data || [];
      renderPoems();
    } catch (err) {
      console.error('Errore caricamento poesie:', err);
      if (poemsListContainer) {
        poemsListContainer.innerHTML =
          '<p>Errore nel caricamento delle poesie.</p>';
      }
    }
  }

  // =====================================================
  // SEARCH
  // =====================================================
  if (searchInput) {
    searchInput.addEventListener('input', renderPoems);
  }

  // =====================================================
  // AVVIO
  // =====================================================
  caricaDatiIniziali();
});