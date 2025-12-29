// ===============================
// SUPABASE INIT
// ===============================
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q';

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===============================
document.addEventListener('DOMContentLoaded', () => {
// ===============================

/* ===============================
   STATO
================================ */
let allPoems = [];
let currentRating = 0;

/* ===============================
   ELEMENTI DOM
================================ */
const poemsListContainer = document.querySelector('.poems-list');
const votingModal = document.getElementById('voting-modal');
const closeVotingModalBtn = document.getElementById('close-voting-modal-btn');
const votePoemIdInput = document.getElementById('vote-poem-id');
const voteMessage = document.getElementById('vote-form-message');
const submitVoteBtn = document.getElementById('submit-vote-btn');
const starRatingContainer = document.querySelector('#voting-modal .star-rating');

const votePoemTitle = document.getElementById('vote-poem-title');
const votePoemAuthor = document.getElementById('vote-poem-author');

/* ===============================
   AUTH GOOGLE
================================ */
const googleLoginBtn = document.getElementById('login-google-btn');
const logoutBtn = document.getElementById('logout-btn');

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
  });
}

/* ===============================
   CARICAMENTO POESIE
================================ */
async function caricaDatiIniziali() {
  poemsListContainer.innerHTML = '<p>Caricamento...</p>';

  const { data, error } = await supabaseClient
    .rpc('get_poems_with_votes');

  if (error) {
    console.error(error);
    poemsListContainer.innerHTML = '<p>Errore caricamento poesie</p>';
    return;
  }

  allPoems = data || [];
  renderPoems();
}

/* ===============================
   RENDER CLASSIFICA
================================ */
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
    const rank = ['🥇','🥈','🥉'][i] || '';
    return `
      <article class="poem-row" data-id="${p.id}">
        <div class="poem-info">
          <span>${rank}</span>
          <span>${p.title}</span>
          <span>di ${p.author_name}</span>
        </div>
        <div class="poem-actions">
          <span>${p.vote_count || 0} voti</span>
          <button class="button-vote" data-id="${p.id}">Vota</button>
        </div>
      </article>
    `;
  }).join('');

  attachPoemHandlers();
}

/* ===============================
   HANDLER CLICK
================================ */
function attachPoemHandlers() {
  document.querySelectorAll('.button-vote').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openVoteModal(btn.dataset.id);
    });
  });
}

/* ===============================
   MODALE VOTO
================================ */
function openVoteModal(poemId) {
  const poem = allPoems.find(p => String(p.id) === String(poemId));
  if (!poem) return;

  votePoemTitle.textContent = poem.title;
  votePoemAuthor.textContent = `di ${poem.author_name}`;
  votePoemIdInput.value = poem.id;

  resetStars();
  votingModal.classList.remove('hidden');
}

if (closeVotingModalBtn) {
  closeVotingModalBtn.addEventListener('click', () => {
    votingModal.classList.add('hidden');
    resetVotingModal();
  });
}

/* ===============================
   STELLE
================================ */
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

if (starRatingContainer) {
  starRatingContainer.querySelectorAll('label.star').forEach((label, i) => {
    label.addEventListener('click', () => {
      currentRating = i + 1;
      highlightStars(currentRating);
    });
  });
}

/* ===============================
   INVIO VOTO
================================ */
if (submitVoteBtn) {
  submitVoteBtn.addEventListener('click', async () => {
    if (!currentRating) {
      voteMessage.textContent = 'Seleziona le stelle';
      voteMessage.style.color = 'red';
      return;
    }

    const poemId = Number(votePoemIdInput.value);

    try {
      const { error } = await supabaseClient.functions.invoke(
        'invia-voto',
        {
          body: {
            poem_id: poemId,
            rating: currentRating
          }
        }
      );

      if (error) throw error;

      document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;

      voteMessage.textContent = 'Grazie per il voto!';
      voteMessage.style.color = 'green';

      await caricaDatiIniziali();

      setTimeout(() => {
        votingModal.classList.add('hidden');
        resetVotingModal();
      }, 1500);

    } catch (err) {
      console.error(err);
      voteMessage.textContent = 'Errore durante il voto';
      voteMessage.style.color = 'red';
    }
  });
}

function resetVotingModal() {
  voteMessage.textContent = '';
  votePoemIdInput.value = '';
  resetStars();
}

/* ===============================
   START
================================ */
caricaDatiIniziali();

});