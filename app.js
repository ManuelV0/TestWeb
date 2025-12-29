// ========= 1. Inizializzazione di Supabase =========
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========= 2. Esegui il resto del codice quando la pagina è pronta =========
document.addEventListener('DOMContentLoaded', () => {
    // --- Variabile di stato globale per le poesie ---
    let allPoems = [];

    // --- SELEZIONE DI TUTTI GLI ELEMENTI HTML ---
    const poemsListContainer = document.querySelector('.poems-list');
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const googleLoginBtn = document.getElementById('login-google-btn');
    const submissionModal = document.getElementById('submission-modal');
    const openSubmissionModalBtn = document.getElementById('open-submission-modal-btn');
    const closeSubmissionModalBtn = document.getElementById('close-submission-modal-btn');
    const submissionForm = document.getElementById('submission-form');
    const anonymousCheckbox = document.getElementById('anonymous-checkbox');
    const firstNameInput = document.getElementById('author-firstname');
    const lastNameInput = document.getElementById('author-lastname');
    const instagramInput = document.getElementById('author-instagram');
    const formMessage = document.getElementById('form-message');
    const votingModal = document.getElementById('voting-modal');
    const closeVotingModalBtn = document.getElementById('close-voting-modal-btn');
    const starRatingContainer = document.querySelector('#voting-modal .star-rating');
    const submitVoteBtn = document.getElementById('submit-vote-btn');
    const votePoemIdInput = document.getElementById('vote-poem-id');
    const voteMessage = document.getElementById('vote-form-message');
    const howToModal = document.getElementById('how-to-modal');
    const aboutUsModal = document.getElementById('about-us-modal');
	const authorModal = document.getElementById('author-modal');
const authorLink = document.getElementById('author-link');
const closeAuthorModalBtn = document.getElementById('close-author-modal-btn');
const authorExternalLink = document.getElementById('author-external-link'); // link cliccabile
    const howToLink = document.getElementById('how-to-link');
    const aboutUsLink = document.getElementById('about-us-link');
    const closeHowToModalBtn = document.getElementById('close-how-to-modal-btn');
    const closeAboutUsModalBtn = document.getElementById('close-about-us-modal-btn');
    const howToSubmitBtn = document.getElementById('how-to-submit-btn');
    const sidebarParticipateBtn = document.getElementById('sidebar-participate-btn');
    const searchInput = document.getElementById('search-poems');
    const sortBySelect = document.getElementById('sort-by');
    const monthlyPoemsListContainer = document.getElementById('monthly-poems-list');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const discoverMoreTrigger = document.getElementById('discover-more-trigger');
    const expandedContent = document.getElementById('expanded-content');
	// AGGIUNGI QUESTA RIGA:
const shareInstagramBtn = document.getElementById('share-cta-btn');
						
    // Inizio modifica/aggiunta - Ripristino preferenze di ricerca e ordinamento
    function restoreUserPreferences() {
        if (typeof window === 'undefined' || !window.localStorage) return;
        const savedSearchTerm = localStorage.getItem('poetrySearchTerm');
        const savedSortBy = localStorage.getItem('poetrySortBy');
        if (searchInput && savedSearchTerm !== null) {
            searchInput.value = savedSearchTerm;
        }
        if (sortBySelect && savedSortBy !== null) {
            sortBySelect.value = savedSortBy;
        }
    }
    restoreUserPreferences();

    // =======================================================
    // INIZIALIZZAZIONE
    // =======================================================
	
	// =======================================================
// CONDIVISIONE INSTAGRAM
// =======================================================
if (shareInstagramBtn) {
    shareInstagramBtn.addEventListener('click', async function() {
        const shareData = {
            title: 'TheItalianPoetry',
            text: 'Scopri la community di scrittura creativa! ✍️📖 #Poesia #ScritturaCreativa',
            url: window.location.href
        };

        try {
            // Prima prova con la Web Share API (mobile)
            if (navigator.share) {
                await navigator.share(shareData);
            } 
            // Fallback per Instagram diretto su mobile
            else if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.location.href = `instagram://library?AssetPath=${encodeURIComponent(shareData.url)}`;
            }
            // Fallback per desktop
            else {
                showInstagramShareFallback();
            }
        } catch (err) {
            console.log('Errore condivisione:', err);
            showInstagramShareFallback();
        }
    });

    function showInstagramShareFallback() {
        const shareFallback = document.getElementById('share-fallback');
        if (!shareFallback) return;
        
        shareFallback.classList.remove('hidden');
        const shareInput = document.getElementById('poem-share-link');
        if (shareInput) shareInput.value = window.location.href;
        
        // Copia automatica
        navigator.clipboard.writeText(window.location.href).then(() => {
            const originalText = shareInstagramBtn.innerHTML;
            shareInstagramBtn.innerHTML = '<i class="fas fa-check"></i> Link copiato!';
            setTimeout(() => {
                shareInstagramBtn.innerHTML = originalText;
            }, 2000);
        });
    }
}
	
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        caricaDatiIniziali();
    });

    // =======================================================
    // GESTIONE AUTENTICAZIONE
    // =======================================================
    async function signInWith(provider) { 
        await supabaseClient.auth.signInWithOAuth({ 
            provider, 
            options: { redirectTo: window.location.origin } 
        }); 
    }

    async function signOut() { 
        await supabaseClient.auth.signOut(); 
    }

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => signInWith('google'));
    if (logoutBtn) logoutBtn.addEventListener('click', signOut);

    supabaseClient.auth.onAuthStateChange((event, session) => {
        const loggedIn = !!session;
        authButtons.classList.toggle('hidden', loggedIn);
        userInfo.classList.toggle('hidden', !loggedIn);
        
        if (loggedIn) {
            userEmailSpan.textContent = session.user.email;
            openSubmissionModalBtn.disabled = false;
        } else {
            userEmailSpan.textContent = '';
            openSubmissionModalBtn.disabled = true;
        }
    });

    // =======================================================
    // GESTIONE MENU MOBILE
    // =======================================================
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            const navWrapper = document.querySelector('.nav-wrapper');
            const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
            
            mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navWrapper.setAttribute('data-visible', !isExpanded);
            
            // Cambia icona
            const icon = mobileNavToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // =======================================================
    // GESTIONE "SCOPRI DI PIÙ"
    // =======================================================
    if (discoverMoreTrigger && expandedContent) {
        discoverMoreTrigger.addEventListener('click', () => {
            expandedContent.classList.toggle('hidden-content');
            expandedContent.classList.toggle('slide-down');
            
            // Ruota la freccia
            const arrow = discoverMoreTrigger.querySelector('.arrow-down');
            arrow.style.transform = expandedContent.classList.contains('hidden-content') ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }

    // =======================================================
    // GESTIONE MODALI
    // =======================================================
    const setupModal = (modal, openTriggers, closeTriggers) => {
        if (!modal) return;
        openTriggers.forEach(trigger => {
            if (trigger) trigger.addEventListener('click', (e) => { 
                e.preventDefault(); 
                modal.classList.remove('hidden');
                modal.setAttribute('aria-modal', 'true');
            });
        });
        closeTriggers.forEach(trigger => {
            if (trigger) trigger.addEventListener('click', () => {
                modal.classList.add('hidden');
                modal.removeAttribute('aria-modal');
                if (modal === votingModal) { 
                    resetVotingModal(); 
                } 
            });
        });
        modal.addEventListener('click', (e) => { 
            if (e.target === modal) { 
                modal.classList.add('hidden');
                modal.removeAttribute('aria-modal');
                if (modal === votingModal) { 
                    resetVotingModal(); 
                } 
            } 
        });
    };

    setupModal(submissionModal, [openSubmissionModalBtn], [closeSubmissionModalBtn]);
    setupModal(votingModal, [], [closeVotingModalBtn]);
    setupModal(howToModal, [howToLink, sidebarParticipateBtn], [closeHowToModalBtn]);
    setupModal(aboutUsModal, [aboutUsLink], [closeAboutUsModalBtn]);
	setupModal(authorModal, [authorLink], [closeAuthorModalBtn]);
	
	
    if (howToSubmitBtn) {
        howToSubmitBtn.addEventListener('click', async () => {
            howToModal.classList.add('hidden');
            howToModal.removeAttribute('aria-modal');
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session) {
                submissionModal.classList.remove('hidden');
                submissionModal.setAttribute('aria-modal', 'true');
            } else {
                alert("Per favore, accedi con Google prima di inviare una poesia.");
            }
        });
    }

    // =======================================================
    // LOGICA FORM INVIO POESIA
    // =======================================================
    if (anonymousCheckbox) {
        const toggleAnonymousFields = () => {
            const isChecked = anonymousCheckbox.checked;
            [firstNameInput, lastNameInput, instagramInput].forEach(input => {
                input.disabled = isChecked;
                if (isChecked) input.value = '';
            });
        };
        
        anonymousCheckbox.addEventListener('change', toggleAnonymousFields);
        // Imposta stato iniziale
        toggleAnonymousFields();
    }

    if (submissionForm) {
        submissionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (!session) { 
                formMessage.textContent = "Devi effettuare l'accesso per poter inviare una poesia!";
                formMessage.style.color = 'red';
                return; 
            }

            const user = session.user;
            const title = document.getElementById('poem-title').value;
            const content = document.getElementById('poem-content').value;
            const isAnonymous = anonymousCheckbox.checked;
            const author_name = isAnonymous ? 'Anonimo' : `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`.trim();
            const instagram_handle = instagramInput.value.trim();

            if (!title || !content || (!isAnonymous && !author_name)) {
                formMessage.textContent = 'Per favore, compila tutti i campi richiesti.';
                formMessage.style.color = 'red';
                return;
            }

            formMessage.textContent = 'Invio in corso...';
            formMessage.style.color = 'inherit';
            
            try {
                const { error: insertError } = await supabaseClient.from('poesie').insert([{ 
                    title, 
                    content, 
                    author_name, 
                    profile_id: user.id,
                    instagram_handle: isAnonymous ? null : instagram_handle || null
                }]);

                if (insertError) {
                    throw insertError;
                }

                if (!isAnonymous) {
                    await supabaseClient.from('profiles').upsert({ 
                        id: user.id, 
                        username: author_name, 
                        instagram_handle: instagram_handle || null 
                    });
                }

                formMessage.textContent = 'Grazie! La tua poesia è stata inviata con successo!';
                formMessage.style.color = 'green';
                submissionForm.reset();
                
                await caricaDatiIniziali();
                setTimeout(() => {
                    submissionModal.classList.add('hidden');
                    submissionModal.removeAttribute('aria-modal');
                    formMessage.textContent = '';
                }, 3000);
            } catch (error) {
                formMessage.textContent = `Errore: ${error.message}`;
                formMessage.style.color = 'red';
                console.error('Errore durante l\'invio:', error);
            }
        });
    }
    
    // 
// ===============================
// RESET MODALE VOTO
// ===============================
function resetVotingModal() {
  if (voteMessage) {
    voteMessage.textContent = '';
    voteMessage.style.color = '';
  }
  if (votePoemIdInput) {
    votePoemIdInput.value = '';
  }
  resetStars();
}

if (closeVotingModalBtn) {
  closeVotingModalBtn.addEventListener('click', () => {
    votingModal.classList.add('hidden');
    votingModal.removeAttribute('aria-modal');
    resetVotingModal();
  });
}

// ===============================
// APERTURA MODALE VOTO
// ===============================
async function apriModaleVoto(poemId) {
  if (!poemId) return;

  if (document.cookie.includes(`voted-poem-${poemId}=true`)) {
    alert('Hai già votato questa poesia.');
    return;
  }

  try {
    const { data: poem, error } = await supabaseClient
      .from('poesie')
      .select('*')
      .eq('id', poemId)
      .single();

    if (error) throw error;

    document.getElementById('vote-poem-title').textContent = poem.title;
    document.getElementById('vote-poem-author').textContent = `di ${poem.author_name}`;
    votePoemIdInput.value = poem.id;

    resetStars();
    votingModal.classList.remove('hidden');
    votingModal.setAttribute('aria-modal', 'true');
  } catch (err) {
    console.error('Errore apertura voto:', err);
    alert('Errore nel caricamento della votazione');
  }
}






// =======================================================
// ⭐ CLASSIFICA + VOTAZIONE (VERSIONE UNICA STABILE)
// =======================================================

let currentRating = 0;

// ===============================
// RESET MODALE VOTO
// ===============================
function resetVotingModal() {
  if (voteMessage) {
    voteMessage.textContent = '';
    voteMessage.style.color = '';
  }
  if (votePoemIdInput) {
    votePoemIdInput.value = '';
  }
  resetStars();
}

if (closeVotingModalBtn) {
  closeVotingModalBtn.addEventListener('click', () => {
    votingModal.classList.add('hidden');
    votingModal.removeAttribute('aria-modal');
    resetVotingModal();
  });
}

// ===============================
// APERTURA MODALE VOTO
// ===============================
async function apriModaleVoto(poemId) {
  if (!poemId) return;

  if (document.cookie.includes(`voted-poem-${poemId}=true`)) {
    alert('Hai già votato questa poesia.');
    return;
  }

  try {
    const { data: poem, error } = await supabaseClient
      .from('poesie')
      .select('*')
      .eq('id', poemId)
      .single();

    if (error) throw error;

    document.getElementById('vote-poem-title').textContent = poem.title;
    document.getElementById('vote-poem-author').textContent = `di ${poem.author_name}`;
    votePoemIdInput.value = poem.id;

    resetStars();
    votingModal.classList.remove('hidden');
    votingModal.setAttribute('aria-modal', 'true');
  } catch (err) {
    console.error('[OPEN VOTE ERROR]', err);
    alert('Errore nel caricamento della votazione.');
  }
}

// ===============================
// RENDER CLASSIFICA
// ===============================
function renderPoems() {
  if (!poemsListContainer) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const filteredPoems = allPoems.filter(p =>
    !searchTerm ||
    (p.title || '').toLowerCase().includes(searchTerm) ||
    (p.author_name || '').toLowerCase().includes(searchTerm)
  );

  const topTenPoems = [...filteredPoems]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 10);

  poemsListContainer.innerHTML = topTenPoems.length === 0
    ? '<p>Nessuna poesia disponibile.</p>'
    : topTenPoems.map((poesia, index) => {
        const rankEmoji = ['🥇', '🥈', '🥉'][index] || '';
        return `
          <article class="poem-row" data-poem-id="${poesia.id}">
            <div class="poem-info" data-poem-id="${poesia.id}">
              <span class="poem-rank">${rankEmoji}</span>
              <span class="poem-title">${poesia.title}</span>
              <span class="poem-author">di ${poesia.author_name}</span>
            </div>
            <div class="poem-actions">
              <span class="poem-votes">${poesia.vote_count || 0} Voti</span>
              <button class="button-vote" data-poem-id="${poesia.id}">Vota</button>
            </div>
          </article>
        `;
      }).join('');

  attachPoemHandlers();
}

// ===============================
// HANDLER CLICK CLASSIFICA
// ===============================
function attachPoemHandlers() {
  poemsListContainer.querySelectorAll('.poem-row').forEach(row => {
    const poemId = row.dataset.poemId;
    row.querySelector('.poem-info')?.addEventListener('click', () => {
      const poem = allPoems.find(p => String(p.id) === String(poemId));
      if (poem) showPoemDetail(poem);
    });

    row.querySelector('.button-vote')?.addEventListener('click', e => {
      e.stopPropagation();
      apriModaleVoto(poemId);
    });
  });
}

// ===============================
// STELLE
// ===============================
function resetStars() {
  currentRating = 0;
  highlightStars(starRatingContainer, 0);
}

function highlightStars(container, rating) {
  if (!container) return;
  container.querySelectorAll('label.star i').forEach((icon, i) => {
    icon.classList.toggle('fa-solid', i < rating);
    icon.classList.toggle('fa-regular', i >= rating);
  });
}

// ===============================
// INVIO VOTO
// ===============================
if (submitVoteBtn) {
  submitVoteBtn.addEventListener('click', async () => {
    if (!currentRating) {
      voteMessage.textContent = 'Seleziona da 1 a 5 stelle.';
      voteMessage.style.color = 'red';
      return;
    }

    const poemId = Number(votePoemIdInput.value);

    try {
      await supabaseClient.functions.invoke('invia-voto', {
        body: { poem_id: poemId, rating: currentRating }
      });

      document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;
      voteMessage.textContent = 'Grazie per aver votato!';
      voteMessage.style.color = 'green';

      await caricaDatiIniziali();

      setTimeout(() => {
        votingModal.classList.add('hidden');
        resetVotingModal();
      }, 1500);
    } catch (err) {
      console.error('[VOTE ERROR]', err);
      voteMessage.textContent = 'Errore durante il voto.';
      voteMessage.style.color = 'red';
    }
  });
}

