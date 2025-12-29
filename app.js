// ========= 1. Inizializzazione di Supabase =========
const SUPABASE_URL = 'https://djikypgmchywybjxbwar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaWt5cGdtY2h5d3lianhid2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTMyOTIsImV4cCI6MjA2ODc4OTI5Mn0.dXqWkg47xTg2YtfLhBLrFd5AIB838KdsmR9qsMPkk8Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========= 2. Stato Globale =========
let allPoems = [];
let currentRating = 0;

// ========= 3. Esegui il resto del codice quando la pagina è pronta =========
document.addEventListener('DOMContentLoaded', () => {
    // --- Selezione di tutti gli elementi HTML ---
    const elements = {
        poemsListContainer: document.querySelector('.poems-list'),
        authButtons: document.getElementById('auth-buttons'),
        userInfo: document.getElementById('user-info'),
        userEmailSpan: document.getElementById('user-email'),
        logoutBtn: document.getElementById('logout-btn'),
        googleLoginBtn: document.getElementById('login-google-btn'),
        submissionModal: document.getElementById('submission-modal'),
        openSubmissionModalBtn: document.getElementById('open-submission-modal-btn'),
        closeSubmissionModalBtn: document.getElementById('close-submission-modal-btn'),
        submissionForm: document.getElementById('submission-form'),
        anonymousCheckbox: document.getElementById('anonymous-checkbox'),
        firstNameInput: document.getElementById('author-firstname'),
        lastNameInput: document.getElementById('author-lastname'),
        instagramInput: document.getElementById('author-instagram'),
        formMessage: document.getElementById('form-message'),
        votingModal: document.getElementById('voting-modal'),
        closeVotingModalBtn: document.getElementById('close-voting-modal-btn'),
        starRatingContainer: document.querySelector('#voting-modal .star-rating'),
        submitVoteBtn: document.getElementById('submit-vote-btn'),
        votePoemIdInput: document.getElementById('vote-poem-id'),
        voteMessage: document.getElementById('vote-form-message'),
        howToModal: document.getElementById('how-to-modal'),
        aboutUsModal: document.getElementById('about-us-modal'),
        authorModal: document.getElementById('author-modal'),
        authorLink: document.getElementById('author-link'),
        closeAuthorModalBtn: document.getElementById('close-author-modal-btn'),
        authorExternalLink: document.getElementById('author-external-link'),
        howToLink: document.getElementById('how-to-link'),
        aboutUsLink: document.getElementById('about-us-link'),
        closeHowToModalBtn: document.getElementById('close-how-to-modal-btn'),
        closeAboutUsModalBtn: document.getElementById('close-about-us-modal-btn'),
        howToSubmitBtn: document.getElementById('how-to-submit-btn'),
        sidebarParticipateBtn: document.getElementById('sidebar-participate-btn'),
        searchInput: document.getElementById('search-poems'),
        sortBySelect: document.getElementById('sort-by'),
        mobileNavToggle: document.querySelector('.mobile-nav-toggle'),
        discoverMoreTrigger: document.getElementById('discover-more-trigger'),
        expandedContent: document.getElementById('expanded-content'),
        shareInstagramBtn: document.getElementById('share-cta-btn')
    };

    // Correzione definitiva delle stelle: assicura LTR
    if (elements.starRatingContainer) {
        elements.starRatingContainer.style.direction = 'ltr';
        const computedStyle = window.getComputedStyle(elements.starRatingContainer);
        if (computedStyle.flexDirection === 'row-reverse') {
            elements.starRatingContainer.style.flexDirection = 'row';
        }
    }

    // --- Ripristino preferenze di ricerca e ordinamento ---
    function restoreUserPreferences() {
        if (typeof window === 'undefined' || !window.localStorage) return;
        
        const savedSearchTerm = localStorage.getItem('poetrySearchTerm');
        const savedSortBy = localStorage.getItem('poetrySortBy');
        
        if (elements.searchInput && savedSearchTerm !== null) {
            elements.searchInput.value = savedSearchTerm;
        }
        if (elements.sortBySelect && savedSortBy !== null) {
            elements.sortBySelect.value = savedSortBy;
        }
    }

    // --- Caricamento dati iniziali ---
    async function caricaDatiIniziali() {
        try {
            const { data, error } = await supabaseClient.rpc('get_poems_with_votes');
            
            if (error) throw error;
            
            allPoems = data || [];
            renderPoems();
        } catch (error) {
            console.error('Errore nel caricamento delle poesie:', error);
            if (elements.poemsListContainer) {
                elements.poemsListContainer.innerHTML = '<p>Errore nel caricamento delle poesie.</p>';
            }
        }
    }

    // --- Inizializzazione ---
    restoreUserPreferences();
    
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        updateAuthUI(session);
        caricaDatiIniziali();
    });

    // ========= 4. GESTIONE AUTENTICAZIONE =========
    async function signInWithGoogle() {
        await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    }

    async function signOut() {
        await supabaseClient.auth.signOut();
    }

    function updateAuthUI(session) {
        const loggedIn = !!session;
        
        if (elements.authButtons) {
            elements.authButtons.classList.toggle('hidden', loggedIn);
        }
        if (elements.userInfo) {
            elements.userInfo.classList.toggle('hidden', !loggedIn);
        }
        if (loggedIn && elements.userEmailSpan) {
            elements.userEmailSpan.textContent = session.user.email;
        }
        if (elements.userEmailSpan && !loggedIn) {
            elements.userEmailSpan.textContent = '';
        }
        if (elements.openSubmissionModalBtn) {
            elements.openSubmissionModalBtn.disabled = !loggedIn;
        }
    }

    // Event listeners per autenticazione
    if (elements.googleLoginBtn) {
        elements.googleLoginBtn.addEventListener('click', signInWithGoogle);
    }
    
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', signOut);
    }

    // Listener per cambiamenti di stato dell'autenticazione
    supabaseClient.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session);
    });

    // ========= 5. GESTIONE MENU MOBILE =========
    if (elements.mobileNavToggle) {
        elements.mobileNavToggle.addEventListener('click', () => {
            const navWrapper = document.querySelector('.nav-wrapper');
            const isExpanded = elements.mobileNavToggle.getAttribute('aria-expanded') === 'true';
            
            elements.mobileNavToggle.setAttribute('aria-expanded', !isExpanded);
            navWrapper.setAttribute('data-visible', !isExpanded);
            
            // Cambia icona
            const icon = elements.mobileNavToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // ========= 6. GESTIONE "SCOPRI DI PIÙ" =========
    if (elements.discoverMoreTrigger && elements.expandedContent) {
        elements.discoverMoreTrigger.addEventListener('click', () => {
            elements.expandedContent.classList.toggle('hidden-content');
            elements.expandedContent.classList.toggle('slide-down');
            
            // Ruota la freccia
            const arrow = elements.discoverMoreTrigger.querySelector('.arrow-down');
            if (arrow) {
                arrow.style.transform = elements.expandedContent.classList.contains('hidden-content') 
                    ? 'rotate(0deg)' 
                    : 'rotate(180deg)';
            }
        });
    }

    // ========= 7. GESTIONE MODALI =========
    function setupModal(modal, openTriggers, closeTriggers, onOpen = null, onClose = null) {
        if (!modal) return;
        
        // Apertura modal
        openTriggers.forEach(trigger => {
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    modal.classList.remove('hidden');
                    modal.setAttribute('aria-modal', 'true');
                    if (onOpen) onOpen();
                });
            }
        });
        
        // Chiusura modal
        closeTriggers.forEach(trigger => {
            if (trigger) {
                trigger.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    modal.removeAttribute('aria-modal');
                    if (onClose) onClose();
                });
            }
        });
        
        // Chiusura click esterno
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.removeAttribute('aria-modal');
                if (onClose) onClose();
            }
        });
    }

    // Configurazione modali
    setupModal(elements.submissionModal, [elements.openSubmissionModalBtn], [elements.closeSubmissionModalBtn]);
    setupModal(elements.votingModal, [], [elements.closeVotingModalBtn], null, resetVotingModalState);
    setupModal(elements.howToModal, [elements.howToLink, elements.sidebarParticipateBtn], [elements.closeHowToModalBtn]);
    setupModal(elements.aboutUsModal, [elements.aboutUsLink], [elements.closeAboutUsModalBtn]);
    setupModal(elements.authorModal, [elements.authorLink], [elements.closeAuthorModalBtn]);

    // Gestione pulsante "Come Partecipare" -> Invio poesia
    if (elements.howToSubmitBtn) {
        elements.howToSubmitBtn.addEventListener('click', async () => {
            elements.howToModal.classList.add('hidden');
            elements.howToModal.removeAttribute('aria-modal');
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session) {
                elements.submissionModal.classList.remove('hidden');
                elements.submissionModal.setAttribute('aria-modal', 'true');
            } else {
                alert("Per favore, accedi con Google prima di inviare una poesia.");
            }
        });
    }

    // ========= 8. LOGICA FORM INVIO POESIA =========
    if (elements.anonymousCheckbox) {
        function toggleAnonymousFields() {
            const isChecked = elements.anonymousCheckbox.checked;
            const fields = [elements.firstNameInput, elements.lastNameInput, elements.instagramInput];
            
            fields.forEach(input => {
                if (input) {
                    input.disabled = isChecked;
                    if (isChecked) input.value = '';
                }
            });
        }
        
        elements.anonymousCheckbox.addEventListener('change', toggleAnonymousFields);
        toggleAnonymousFields();
    }

    if (elements.submissionForm) {
        elements.submissionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (!session) {
                if (elements.formMessage) {
                    elements.formMessage.textContent = "Devi effettuare l'accesso per poter inviare una poesia!";
                    elements.formMessage.style.color = 'red';
                }
                return;
            }
            
            const user = session.user;
            const title = document.getElementById('poem-title')?.value || '';
            const content = document.getElementById('poem-content')?.value || '';
            const isAnonymous = elements.anonymousCheckbox?.checked || false;
            const firstName = elements.firstNameInput?.value?.trim() || '';
            const lastName = elements.lastNameInput?.value?.trim() || '';
            const instagramHandle = elements.instagramInput?.value?.trim() || '';
            
            const authorName = isAnonymous 
                ? 'Anonimo' 
                : `${firstName} ${lastName}`.trim();
            
            if (!title || !content || (!isAnonymous && !authorName)) {
                if (elements.formMessage) {
                    elements.formMessage.textContent = 'Per favore, compila tutti i campi richiesti.';
                    elements.formMessage.style.color = 'red';
                }
                return;
            }
            
            if (elements.formMessage) {
                elements.formMessage.textContent = 'Invio in corso...';
                elements.formMessage.style.color = 'inherit';
            }
            
            try {
                const { error: insertError } = await supabaseClient
                    .from('poesie')
                    .insert([{
                        title,
                        content,
                        author_name: authorName,
                        profile_id: user.id,
                        instagram_handle: isAnonymous ? null : instagramHandle || null
                    }]);
                
                if (insertError) throw insertError;
                
                if (!isAnonymous) {
                    await supabaseClient
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            username: authorName,
                            instagram_handle: instagramHandle || null
                        });
                }
                
                if (elements.formMessage) {
                    elements.formMessage.textContent = 'Grazie! La tua poesia è stata inviata con successo!';
                    elements.formMessage.style.color = 'green';
                }
                
                elements.submissionForm.reset();
                await caricaDatiIniziali();
                
                setTimeout(() => {
                    elements.submissionModal.classList.add('hidden');
                    elements.submissionModal.removeAttribute('aria-modal');
                    if (elements.formMessage) {
                        elements.formMessage.textContent = '';
                    }
                }, 3000);
                
            } catch (error) {
                console.error('Errore durante l\'invio:', error);
                if (elements.formMessage) {
                    elements.formMessage.textContent = `Errore: ${error.message}`;
                    elements.formMessage.style.color = 'red';
                }
            }
        });
    }

    // ========= 9. RENDERING POESIE E CLASSIFICA =========
    function renderPoems() {
        if (!elements.poemsListContainer) return;
        
        const searchTerm = elements.searchInput ? elements.searchInput.value.toLowerCase() : '';
        const sortBy = elements.sortBySelect ? elements.sortBySelect.value : 'votes';
        
        // Filtra poesie
        let filteredPoems = allPoems.filter(poem => {
            if (!searchTerm) return true;
            
            const titleMatch = (poem.title || '').toLowerCase().includes(searchTerm);
            const authorMatch = (poem.author_name || '').toLowerCase().includes(searchTerm);
            
            return titleMatch || authorMatch;
        });
        
        // Ordina deterministicamente
        filteredPoems.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'author':
                    return (a.author_name || '').localeCompare(b.author_name || '');
                case 'votes':
                default:
                    return (b.vote_count || 0) - (a.vote_count || 0);
            }
        });
        
        // Prendi top 10
        const topTenPoems = filteredPoems.slice(0, 10);
        
        if (topTenPoems.length === 0) {
            elements.poemsListContainer.innerHTML = '<p>Nessuna poesia disponibile.</p>';
            return;
        }
        
        const poemsHTML = topTenPoems.map((poem, index) => {
            const rankEmoji = ['🥇', '🥈', '🥉'][index] || '';
            const voteCount = poem.vote_count || 0;
            
            return `
                <article class="poem-row" data-poem-id="${poem.id}">
                    <div class="poem-info" data-poem-id="${poem.id}">
                        <span class="poem-rank">${rankEmoji}</span>
                        <span class="poem-title">${poem.title}</span>
                        <span class="poem-author">di ${poem.author_name}</span>
                    </div>
                    <div class="poem-actions">
                        <span class="poem-votes">${voteCount} Voti</span>
                        <button class="button-vote" data-poem-id="${poem.id}">Vota</button>
                    </div>
                </article>
            `;
        }).join('');
        
        elements.poemsListContainer.innerHTML = poemsHTML;
        attachPoemHandlers();
    }

    function attachPoemHandlers() {
        if (!elements.poemsListContainer) return;
        
        const poemRows = elements.poemsListContainer.querySelectorAll('.poem-row');
        
        poemRows.forEach(row => {
            const poemId = row.dataset.poemId;
            
            // Click sulla poesia per dettaglio
            const poemInfo = row.querySelector('.poem-info');
            if (poemInfo) {
                poemInfo.addEventListener('click', () => {
                    console.log(`Mostra dettaglio poesia ${poemId}`);
                    // Rimuoviamo la chiamata a showPoemDetail per evitare errori
                });
            }
            
            // Click su "Vota"
            const voteButton = row.querySelector('.button-vote');
            if (voteButton) {
                voteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    prepareAndOpenVoteModal(poemId);
                });
            }
        });
    }

    // ========= 10. GESTIONE VOTAZIONE (Separazione responsabilità) =========
    async function loadPoemForVoting(poemId) {
        if (!poemId) return null;
        
        try {
            const { data: poem, error } = await supabaseClient
                .from('poesie')
                .select('*')
                .eq('id', poemId)
                .single();
            
            if (error) throw error;
            return poem;
        } catch (error) {
            console.error('Errore nel caricamento della poesia per voto:', error);
            return null;
        }
    }

    function openVoteModal(poemData) {
        if (!poemData) return;
        
        const votePoemTitle = document.getElementById('vote-poem-title');
        const votePoemAuthor = document.getElementById('vote-poem-author');
        
        if (votePoemTitle) votePoemTitle.textContent = poemData.title;
        if (votePoemAuthor) votePoemAuthor.textContent = `di ${poemData.author_name}`;
        if (elements.votePoemIdInput) elements.votePoemIdInput.value = poemData.id;
        
        // NON resettare lo stato qui - mantiene il rating se l'utente cambia stelle
        // Solo highlight con rating corrente (0 se prima volta)
        highlightStars(currentRating);
        
        if (elements.votingModal) {
            elements.votingModal.classList.remove('hidden');
            elements.votingModal.setAttribute('aria-modal', 'true');
        }
    }

    async function prepareAndOpenVoteModal(poemId) {
        if (!poemId) return;
        
        // Controlla se l'utente ha già votato
        if (document.cookie.includes(`voted-poem-${poemId}=true`)) {
            alert('Hai già votato questa poesia.');
            return;
        }
        
        const poemData = await loadPoemForVoting(poemId);
        if (poemData) {
            openVoteModal(poemData);
        } else {
            alert('Errore nel caricamento della poesia per la votazione.');
        }
    }

    function resetVotingModalState() {
        // Resetta SOLO quando il modal viene chiuso
        currentRating = 0;
        
        if (elements.voteMessage) {
            elements.voteMessage.textContent = '';
            elements.voteMessage.style.color = '';
        }
        
        resetStars();
    }

    function resetStars() {
        highlightStars(0);
    }

    function highlightStars(rating) {
        if (!elements.starRatingContainer) return;
        
        const stars = elements.starRatingContainer.querySelectorAll('label.star i');
        
        stars.forEach((star, index) => {
            // Correzione definitiva: stelle da sinistra a destra
            // Prima stella (indice 0) = rating 1
            if (index < rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            } else {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
        });
    }

    // Configurazione stelle corretta
    function setupStarRating() {
        if (!elements.starRatingContainer) return;
        
        const stars = elements.starRatingContainer.querySelectorAll('label.star');
        
        stars.forEach((star, index) => {
            const starIndex = index;
            
            star.addEventListener('mouseenter', () => {
                highlightStars(starIndex + 1);
            });
            
            star.addEventListener('mouseleave', () => {
                highlightStars(currentRating);
            });
            
            star.addEventListener('click', () => {
                currentRating = starIndex + 1;
                highlightStars(currentRating);
            });
        });
    }
    
    // Inizializza il sistema di stelle
    setupStarRating();

    // ========= CORREZIONE CRITICA: LOGICA DI SUBMIT VOTO =========
    if (elements.submitVoteBtn) {
        elements.submitVoteBtn.addEventListener('click', async () => {
            if (currentRating === 0) {
                if (elements.voteMessage) {
                    elements.voteMessage.textContent = 'Seleziona da 1 a 5 stelle.';
                    elements.voteMessage.style.color = 'red';
                }
                return;
            }
            
            const poemId = Number(elements.votePoemIdInput?.value);
            
            if (!poemId) {
                if (elements.voteMessage) {
                    elements.voteMessage.textContent = 'Errore: ID poesia non valido.';
                    elements.voteMessage.style.color = 'red';
                }
                return;
            }
            
            if (elements.voteMessage) {
                elements.voteMessage.textContent = 'Invio voto in corso...';
                elements.voteMessage.style.color = 'inherit';
            }
            
            try {
                // Payload corretto per la Edge Function
                const payload = { poem_id: poemId, rating: currentRating };
                
                // Chiamata alla Edge Function con gestione semplificata della risposta
                const { error } = await supabaseClient.functions.invoke('invia-voto', {
                    body: payload
                });
                
                // CORREZIONE CRITICA: considera il voto riuscito quando error è nullo
                // Non controllare data.success o data obbligatorio
                if (error) {
                    throw new Error(`Errore Edge Function: ${error.message}`);
                }
                
                // Se non c'è errore, il voto è andato a buon fine
                document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;
                
                if (elements.voteMessage) {
                    elements.voteMessage.textContent = 'Grazie per aver votato!';
                    elements.voteMessage.style.color = 'green';
                }
                
                // Ricarica i dati per aggiornare la classifica
                await caricaDatiIniziali();
                
                setTimeout(() => {
                    if (elements.votingModal) {
                        elements.votingModal.classList.add('hidden');
                        elements.votingModal.removeAttribute('aria-modal');
                    }
                    resetVotingModalState();
                }, 1500);
                
            } catch (error) {
                console.error('Errore durante il voto:', error);
                if (elements.voteMessage) {
                    elements.voteMessage.textContent = `Errore durante il voto: ${error.message}`;
                    elements.voteMessage.style.color = 'red';
                }
            }
        });
    }

    // ========= 11. CONDIVISIONE INSTAGRAM =========
    if (elements.shareInstagramBtn) {
        elements.shareInstagramBtn.addEventListener('click', async function() {
            const shareData = {
                title: 'TheItalianPoetry',
                text: 'Scopri la community di scrittura creativa! ✍️📖 #Poesia #ScritturaCreativa',
                url: window.location.href
            };
            
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                    return;
                }
                
                if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    window.location.href = `instagram://library?AssetPath=${encodeURIComponent(shareData.url)}`;
                    return;
                }
                
                showInstagramShareFallback();
                
            } catch (error) {
                console.log('Errore condivisione:', error);
                showInstagramShareFallback();
            }
        });
        
        function showInstagramShareFallback() {
            const shareFallback = document.getElementById('share-fallback');
            if (!shareFallback) return;
            
            shareFallback.classList.remove('hidden');
            
            const shareInput = document.getElementById('poem-share-link');
            if (shareInput) {
                shareInput.value = window.location.href;
            }
            
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalText = elements.shareInstagramBtn.innerHTML;
                elements.shareInstagramBtn.innerHTML = '<i class="fas fa-check"></i> Link copiato!';
                
                setTimeout(() => {
                    elements.shareInstagramBtn.innerHTML = originalText;
                }, 2000);
            });
        }
    }

    // ========= 12. RICERCA E ORDINAMENTO =========
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', () => {
            if (window.localStorage) {
                localStorage.setItem('poetrySearchTerm', elements.searchInput.value);
            }
            renderPoems();
        });
    }
    
    if (elements.sortBySelect) {
        elements.sortBySelect.addEventListener('change', () => {
            if (window.localStorage) {
                localStorage.setItem('poetrySortBy', elements.sortBySelect.value);
            }
            renderPoems();
        });
    }
});