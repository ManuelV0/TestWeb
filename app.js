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
    
    // =======================================================
    // LOGICA VOTAZIONE
    // =======================================================
    
  
// ===============================
// STATO VOTO
// ===============================
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
    console.error('Errore apertura voto:', err);
    alert('Errore nel caricamento della votazione');
  }
}

// ===============================
// RENDER CLASSIFICA PRINCIPALE
// ===============================
function renderPoems() {
  if (!poemsListContainer) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const sourcePoems = Array.isArray(allPoems) ? allPoems : [];

  let filteredPoems = sourcePoems.filter(p => {
    const t = (p.title || '').toLowerCase();
    const a = (p.author_name || '').toLowerCase();
    return !searchTerm || t.includes(searchTerm) || a.includes(searchTerm);
  });

  const topTenPoems = [...filteredPoems]
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, 10);

  if (topTenPoems.length === 0) {
    poemsListContainer.innerHTML = '<p>Nessuna poesia disponibile.</p>';
    return;
  }

  poemsListContainer.innerHTML = topTenPoems.map((poesia, index) => {
    const rankEmoji = index === 0 ? '🥇' :
                      index === 1 ? '🥈' :
                      index === 2 ? '🥉' : '';

    return `
      <article class="poem-row" data-poem-id="${poesia.id}">
        <div class="poem-info" data-poem-id="${poesia.id}">
          <span class="poem-rank">${rankEmoji}</span>
          <span class="poem-title">${poesia.title}</span>
          <span class="poem-author">di ${poesia.author_name}</span>
        </div>

        <div class="poem-actions">
          <span class="poem-votes">${poesia.vote_count || 0} Voti</span>

          <button
            type="button"
            class="button-vote"
            data-poem-id="${poesia.id}"
          >
            Vota
          </button>
        </div>
      </article>
    `;
  }).join('');

  attachPoemHandlers();
}

// ===============================
// HANDLER CLICK POESIE
// ===============================
function attachPoemHandlers() {
  if (!poemsListContainer) return;

  poemsListContainer.querySelectorAll('.poem-row').forEach(row => {
    const poemId = row.dataset.poemId;

    const info = row.querySelector('.poem-info');
    const voteBtn = row.querySelector('.button-vote');

    // click riga → dettaglio
    if (info) {
      info.addEventListener('click', () => {
        const poem = allPoems.find(p => String(p.id) === String(poemId));
        if (poem) showPoemDetail(poem);
      });
    }

    // click voto → modale voto
    if (voteBtn) {
      voteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        apriModaleVoto(poemId);
      });
    }
  });
}

// ===============================
// STELLE VOTO
// ===============================
function resetStars() {
  currentRating = 0;
  if (!starRatingContainer) return;

  highlightStars(starRatingContainer, 0);
  starRatingContainer
    .querySelectorAll('input[type="radio"]')
    .forEach(i => (i.checked = false));
}

function highlightStars(container, rating) {
  const icons = container.querySelectorAll('label.star i');
  icons.forEach((icon, index) => {
    if (index < rating) {
      icon.classList.add('fa-solid');
      icon.classList.remove('fa-regular');
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
    }
  });
}

// ===============================
// INVIO VOTO
// ===============================
if (submitVoteBtn) {
  submitVoteBtn.addEventListener('click', async () => {
    if (currentRating === 0) {
      voteMessage.textContent = 'Seleziona da 1 a 5 stelle.';
      voteMessage.style.color = 'red';
      return;
    }

    const poemId = parseInt(votePoemIdInput.value, 10);

    try {
      await supabaseClient.functions.invoke('invia-voto', {
        body: {
          poemId,
          rating: currentRating
        }
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
      console.error(err);
      voteMessage.textContent = 'Errore durante il voto.';
      voteMessage.style.color = 'red';
    }
  });
}

// =======================================================
// ⭐ GESTIONE VOTAZIONE
// =======================================================

let currentRating = 0;

function resetVotingModal() {
  voteMessage.textContent = '';
  voteMessage.style.color = '';
  votePoemIdInput.value = '';
  resetStars();
}

if (closeVotingModalBtn) {
  closeVotingModalBtn.addEventListener('click', resetVotingModal);
}

// -------------------------------------------------------
// APERTURA MODALE VOTO
// -------------------------------------------------------
async function apriModaleVoto(poemId) {
  if (!poemId) return;

  // Anti doppio voto lato cookie
  if (document.cookie.includes(`voted-poem-${poemId}=true`)) {
    alert("Hai già votato questa poesia. Grazie!");
    return;
  }

  try {
    const { data: poem, error } = await supabaseClient
      .from('poesie')
      .select('*')
      .eq('id', poemId)
      .single();

    if (error) throw error;

    if (poem) {
      document.getElementById('vote-poem-title').textContent = poem.title;
      document.getElementById('vote-poem-author').textContent = `di ${poem.author_name}`;
      votePoemIdInput.value = poem.id;
      resetStars();
      votingModal.classList.remove('hidden');
      votingModal.setAttribute('aria-modal', 'true');
    }
  } catch (error) {
    console.error('Errore caricamento poesia:', error);
    alert('Errore nel caricamento della poesia.');
  }
}

// -------------------------------------------------------
// VOTO DALLA MODALE PRINCIPALE
// -------------------------------------------------------
if (submitVoteBtn) {
  submitVoteBtn.addEventListener('click', async () => {
    if (currentRating === 0 || currentRating > 5) {
      voteMessage.textContent = 'Seleziona da 1 a 5 stelle.';
      voteMessage.style.color = 'red';
      return;
    }

    const poemId = Number(votePoemIdInput.value);
    if (!Number.isFinite(poemId)) {
      voteMessage.textContent = 'ID poesia non valido.';
      voteMessage.style.color = 'red';
      return;
    }

    voteMessage.textContent = 'Invio in corso...';
    voteMessage.style.color = 'inherit';

    try {
      const { error } = await supabaseClient.functions.invoke('invia-voto', {
        body: {
          poem_id: poemId,     // ✅ FIX FONDAMENTALE
          rating: currentRating
        }
      });

      if (error) {
        console.error('[VOTE ERROR]', error);
        voteMessage.textContent = error.message || 'Errore durante il voto.';
        voteMessage.style.color = 'red';
        return;
      }

      voteMessage.textContent = 'Grazie per aver votato!';
      voteMessage.style.color = 'green';

      document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;
      await caricaDatiIniziali();

      setTimeout(() => {
        votingModal.classList.add('hidden');
        votingModal.removeAttribute('aria-modal');
        resetVotingModal();
      }, 2000);

    } catch (err) {
      console.error('Errore voto:', err);
      voteMessage.textContent = 'Errore durante la votazione.';
      voteMessage.style.color = 'red';
    }
  });
}

// -------------------------------------------------------
// VOTO DALLA POEM DETAIL BOX
// -------------------------------------------------------
function setupStarRating(container, poemId) {
  let localRating = 0;
  const stars = container.querySelectorAll('.star-rating label.star');
  const submitBtn = container.querySelector('#detail-submit-vote-btn');
  const messageEl = container.querySelector('#detail-vote-message');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      localRating = parseInt(star.getAttribute('for').replace('detail-star', ''), 10);
      highlightStars(container, localRating);
    });
  });

  submitBtn.addEventListener('click', async () => {
    if (localRating === 0) {
      messageEl.textContent = 'Seleziona da 1 a 5 stelle.';
      messageEl.style.color = 'red';
      return;
    }

    messageEl.textContent = 'Invio in corso...';

    try {
      const { error } = await supabaseClient.functions.invoke('invia-voto', {
        body: {
          poem_id: poemId,   // ✅ FIX FONDAMENTALE
          rating: localRating
        }
      });

      if (error) throw error;

      messageEl.textContent = 'Grazie per aver votato!';
      messageEl.style.color = 'green';

      document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;
      await caricaDatiIniziali();

      setTimeout(() => {
        document.querySelector('.poem-detail-overlay')?.remove();
        document.querySelector('.poem-detail-box')?.remove();
      }, 2000);

    } catch (err) {
      console.error('Errore voto detail:', err);
      messageEl.textContent = 'Errore durante il voto.';
      messageEl.style.color = 'red';
    }
  });
}


    // FUNZIONE DI RENDER E CARICAMENTO POESIE
  

    function renderPoems() {
        // Inizio modifica/aggiunta - Gestione stato lista poesie
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const sourcePoems = Array.isArray(allPoems) ? allPoems : [];
        let filteredPoems = sourcePoems.filter(poesia => {
            const title = (poesia.title || '').toLowerCase();
            const author = (poesia.author_name || '').toLowerCase();
            return !searchTerm || title.includes(searchTerm) || author.includes(searchTerm);
        });

        const now = new Date();
        const currentMonthUTC = now.getUTCMonth();
        const currentYearUTC = now.getUTCFullYear();
        let monthlyPoems = filteredPoems.filter(poesia => {
            const poemDate = new Date(poesia.created_at);
            return poemDate.getUTCMonth() === currentMonthUTC && poemDate.getUTCFullYear() === currentYearUTC;
        });

        const sortBy = sortBySelect ? sortBySelect.value : 'recent';
        monthlyPoems.sort((a, b) => {
            switch (sortBy) {
                case 'popular': return (b.vote_count || 0) - (a.vote_count || 0);
                case 'title-asc': return (a.title || '').localeCompare(b.title || '');
                case 'title-desc': return (b.title || '').localeCompare(a.title || '');
                default: return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        const topTenPoems = [...filteredPoems].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0)).slice(0, 10);

        if (poemsListContainer) {
            if (topTenPoems.length === 0) {
                const emptyMessage = sourcePoems.length === 0
                    ? 'Non ci sono ancora poesie. Sii il primo a partecipare!'
                    : 'Nessuna poesia corrisponde ai criteri di ricerca.';
                poemsListContainer.innerHTML = `<p>${emptyMessage}</p>`;
            } else {
                poemsListContainer.innerHTML = topTenPoems.map((poesia, index) => {
                    const rankEmoji = index === 0 ? '🥇' :
                                      index === 1 ? '🥈' :
                                      index === 2 ? '🥉' : '';

                    const rankGlowClass = index < 3 ? 'glow-rank' : '';

                    const instagramIcon = poesia.instagram_handle ? 
                        `<a href="https://www.instagram.com/${poesia.instagram_handle}" target="_blank" class="social-icon" aria-label="Instagram"><i class="fab fa-instagram"></i></a>` : '';

                    return `
                        <article class="poem-row" data-poem-id="${poesia.id}">
    					<div class="poem-info ${rankGlowClass}" data-poem-id="${poesia.id}">
    <span class="poem-rank">${rankEmoji}</span>
    <span class="poem-title">${poesia.title}</span>
    <span class="poem-author golden-author">di ${poesia.author_name}</span>
</div>
                            <div class="poem-actions">
                                ${instagramIcon}
                                <span class="poem-votes">${poesia.vote_count || 0} Voti</span>
                                <button class="button-vote" data-poem-id="${poesia.id}">Vota</button>
                            </div>
                        </article>`;
                }).join('');
                attachPoemInfoHandlers();
            }
        }

        if (monthlyPoemsListContainer) {
            if (monthlyPoems.length === 0) {
                monthlyPoemsListContainer.innerHTML = '<p style="font-size: 0.9rem; color: #777;">Nessuna poesia per questo mese.</p>';
            } else {
                monthlyPoemsListContainer.innerHTML = monthlyPoems.map(poesia => {
                    const poemDate = new Date(poesia.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
                    return `
                        <div class="mini-poem-item" data-poem-id="${poesia.id}">
                            <span class="mini-poem-title">${poesia.title}</span>
                            <span class="mini-poem-author">di ${poesia.author_name}</span>
                            <span class="mini-poem-date">${poemDate}</span>
                        </div>`;
                }).join('');
            }
        }
    }

    // Inizio modifica/aggiunta - Gestione interazioni elenco poesie
    function attachPoemInfoHandlers() {
        if (!poemsListContainer) return;
        const infoElements = poemsListContainer.querySelectorAll('.poem-info');
        infoElements.forEach(el => {
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            const poemId = el.dataset.poemId;
            const handleActivation = () => {
                const poem = allPoems.find(p => String(p.id) === String(poemId));
                if (poem) showPoemDetail(poem);
            };
            el.addEventListener('click', handleActivation);
            el.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleActivation();
                }
            });
        });
    }

    async function caricaDatiIniziali() {
        if (poemsListContainer) poemsListContainer.innerHTML = '<p>Caricamento...</p>';
        if (monthlyPoemsListContainer) monthlyPoemsListContainer.innerHTML = '<p>Caricamento...</p>';
        
        try {
            const { data, error } = await supabaseClient.rpc('get_poems_with_votes');
            
            if (error) throw error;
            
            allPoems = data;
            renderPoems();
        } catch (error) {
            console.error('Errore nel caricamento delle poesie:', error);
            if (poemsListContainer) poemsListContainer.innerHTML = '<p>Errore nel caricamento delle poesie. Riprova più tardi.</p>';
            if (monthlyPoemsListContainer) monthlyPoemsListContainer.innerHTML = '<p>Errore nel caricamento delle poesie.</p>';
        }
    }
    
    if(searchInput) {
        // Inizio modifica/aggiunta - Salvataggio termine di ricerca
        searchInput.addEventListener('input', () => {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('poetrySearchTerm', searchInput.value);
            }
            renderPoems();
        });
    }
    if(sortBySelect) {
        // Inizio modifica/aggiunta - Salvataggio ordinamento selezionato
        sortBySelect.addEventListener('change', () => {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('poetrySortBy', sortBySelect.value);
            }
            renderPoems();
        });
    }
});


 // --- script minimale (fine mese) -->

    (function () {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      const ids = {
        d: document.getElementById('countdown-days'),
        h: document.getElementById('countdown-hours'),
        m: document.getElementById('countdown-minutes'),
        s: document.getElementById('countdown-seconds'),
      };
      if (!ids.d || !ids.h || !ids.m || !ids.s) return;

      function pad(n){ return n.toString().padStart(2,'0'); }
      function tick(){
        const diff = endOfMonth - new Date();
        if (diff <= 0) {
          ids.d.textContent = ids.h.textContent = ids.m.textContent = ids.s.textContent = '00';
          return;
        }
        const d = Math.floor(diff / (1000*60*60*24));
        const h = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        const m = Math.floor((diff % (1000*60*60)) / (1000*60));
        const s = Math.floor((diff % (1000*60)) / 1000);

        ['d','h','m','s'].forEach(k => { ids[k].classList.remove('changing'); void ids[k].offsetWidth; ids[k].classList.add('changing'); });

        ids.d.textContent = pad(d);
        ids.h.textContent = pad(h);
        ids.m.textContent = pad(m);
        ids.s.textContent = pad(s);
      }
      tick();
      setInterval(tick, 1000);
    })();


