// =======================================================
// 1. SUPABASE INIT
// =======================================================
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// =======================================================
// 2. DOM READY
// =======================================================
document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // STATO GLOBALE
  // =====================================================
  let allPoems = [];
  let currentRating = 0;

  // =====================================================
  // DOM SELECTORS
  // =====================================================
  const poemsListContainer = document.querySelector('.poems-list');

  const googleLoginBtn = document.getElementById('login-google-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authButtons = document.getElementById('auth-buttons');
  const userInfo = document.getElementById('user-info');
  const userEmailSpan = document.getElementById('user-email');

  const votingModal = document.getElementById('voting-modal');
  const closeVotingModalBtn = document.getElementById('close-voting-modal-btn');
  const submitVoteBtn = document.getElementById('submit-vote-btn');
  const votePoemIdInput = document.getElementById('vote-poem-id');
  const voteMessage = document.getElementById('vote-form-message');
  const starRatingContainer = document.querySelector('#voting-modal .star-rating');

  // =====================================================
  // 3. AUTH
  // =====================================================
  async function signInWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  }

  async function signOut() {
    await supabaseClient.auth.signOut();
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', signInWithGoogle);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }

  supabaseClient.auth.onAuthStateChange((_, session) => {
    const loggedIn = !!session;
    authButtons?.classList.toggle('hidden', loggedIn);
    userInfo?.classList.toggle('hidden', !loggedIn);
    if (session && userEmailSpan) {
      userEmailSpan.textContent = session.user.email;
    }
  });

  // =====================================================
  // 4. LOAD POEMS
  // =====================================================
  async function loadPoems() {
    try {
      const { data, error } = await supabaseClient.rpc('get_poems_with_votes');
      if (error) throw error;
      allPoems = data || [];
      renderPoems();
    } catch (err) {
      console.error('[LOAD POEMS ERROR]', err);
      poemsListContainer.innerHTML = '<p>Errore nel caricamento poesie</p>';
    }
  }

  // =====================================================
  // 5. RENDER CLASSIFICA
  // =====================================================
  function renderPoems() {
    if (!poemsListContainer) return;

    const topTen = [...allPoems]
      .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
      .slice(0, 10);

    if (topTen.length === 0) {
      poemsListContainer.innerHTML = '<p>Nessuna poesia disponibile</p>';
      return;
    }

    poemsListContainer.innerHTML = topTen.map((p, i) => {
      const rank = ['🥇', '🥈', '🥉'][i] || '';
      return `
        <article class="poem-row" data-id="${p.id}">
          <div class="poem-info">
            <span class="poem-rank">${rank}</span>
            <span class="poem-title">${p.title}</span>
            <span class="poem-author">di ${p.author_name}</span>
          </div>
          <div class="poem-actions">
            <span class="poem-votes">${p.vote_count || 0} Voti</span>
            <button class="button-vote" data-id="${p.id}">Vota</button>
          </div>
        </article>
      `;
    }).join('');

    attachPoemHandlers();
  }

  // =====================================================
  // 6. HANDLERS CLASSIFICA
  // =====================================================
  function attachPoemHandlers() {
    poemsListContainer.querySelectorAll('.poem-row').forEach(row => {
      const poemId = row.dataset.id;

      row.querySelector('.button-vote')?.addEventListener('click', e => {
        e.stopPropagation();
        openVoteModal(poemId);
      });
    });
  }

  // =====================================================
  // 7. MODALE VOTO
  // =====================================================
  function openVoteModal(poemId) {
    if (!poemId) return;

    if (document.cookie.includes(`voted-poem-${poemId}=true`)) {
      alert('Hai già votato questa poesia.');
      return;
    }

    votePoemIdInput.value = poemId;
    resetStars();
    votingModal.classList.remove('hidden');
  }

  function closeVoteModal() {
    votingModal.classList.add('hidden');
    voteMessage.textContent = '';
    resetStars();
  }

  if (closeVotingModalBtn) {
    closeVotingModalBtn.addEventListener('click', closeVoteModal);
  }

  // =====================================================
  // 8. STELLE
  // =====================================================
  function resetStars() {
    currentRating = 0;
    highlightStars(0);
  }

  function highlightStars(rating) {
    if (!starRatingContainer) return;
    starRatingContainer.querySelectorAll('label.star i')
      .forEach((icon, i) => {
        icon.classList.toggle('fa-solid', i < rating);
        icon.classList.toggle('fa-regular', i >= rating);
      });
  }

  starRatingContainer?.querySelectorAll('label.star').forEach((label, i) => {
    label.addEventListener('click', () => {
      currentRating = i + 1;
      highlightStars(currentRating);
    });
  });

  // =====================================================
  // 9. INVIO VOTO
  // =====================================================
  if (submitVoteBtn) {
    submitVoteBtn.addEventListener('click', async () => {
      if (!currentRating) {
        voteMessage.textContent = 'Seleziona da 1 a 5 stelle';
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

        document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;
        voteMessage.textContent = 'Grazie per aver votato!';
        voteMessage.style.color = 'green';

        await loadPoems();

        setTimeout(closeVoteModal, 1500);

      } catch (err) {
        console.error('[VOTE ERROR]', err);
        voteMessage.textContent = 'Errore durante il voto';
        voteMessage.style.color = 'red';
      }
    });
  }

  // =====================================================
  // INIT
  // =====================================================
  loadPoems();
});


// =======================================================
// 10. COUNTDOWN (FUORI DAL DOM READY)
// =======================================================
(function () {
  const d = document.getElementById('countdown-days');
  const h = document.getElementById('countdown-hours');
  const m = document.getElementById('countdown-minutes');
  const s = document.getElementById('countdown-seconds');
  if (!d || !h || !m || !s) return;

  const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  function pad(n) { return n.toString().padStart(2, '0'); }

  function tick() {
    const diff = end - new Date();
    if (diff <= 0) return;

    d.textContent = pad(Math.floor(diff / 86400000));
    h.textContent = pad(Math.floor(diff / 3600000) % 24);
    m.textContent = pad(Math.floor(diff / 60000) % 60);
    s.textContent = pad(Math.floor(diff / 1000) % 60);
  }

  tick();
  setInterval(tick, 1000);
})();