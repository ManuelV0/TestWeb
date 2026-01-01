import { trackInteraction } from './ai-interactions-core.js';


import { trackInteraction } from './ai-interactions-core.js';

/* =========================================
   LISTENER INTERAZIONI DAL WIDGET (IFRAME)
========================================= */
window.addEventListener('message', async (event) => {
  if (event.data?.type !== 'TRACK_INTERACTION') return;

  const { action, poemId, weight } = event.data.payload;

  console.log('[PARENT RECEIVED]', { action, poemId, weight });

  await trackInteraction({ action, poemId, weight });

  // 🔄 forza refresh classifica intelligente
  window.dispatchEvent(new Event('interaction-updated'));
});


let supabaseClient = null;
let allPoems = [];
let currentRating = 0;

document.addEventListener('DOMContentLoaded', () => {

  // ✅ prende l’istanza globale
  supabaseClient = window.supabaseClient;

  if (!supabaseClient) {
    console.error('❌ Supabase non inizializzato');
    return;
  }

  console.log('✅ Supabase pronto');

 


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
        shareInstagramBtn: document.getElementById('share-cta-btn'),
        primaryNavigation: document.getElementById('primary-navigation') || document.querySelector('.nav-wrapper'),
        shareFallback: document.getElementById('share-fallback'),
        shareLinkInput: document.getElementById('poem-share-link'),
        copyLinkBtn: document.getElementById('copy-link-btn'),
        copyFeedback: document.getElementById('copy-feedback'),
        scrollTopBtn: document.getElementById('scroll-top-btn'),
        footerParagraph: document.querySelector('.main-footer p')
    };

    const body = document.body;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const focusableSelector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const modalCallbacks = new WeakMap();
    const modalStack = [];
    let copyTimeoutId;

    // ===== Helpers Modali / UI =====
    function openModalElement(modal, options = {}) {
        if (!modal) return;

        const config = modalCallbacks.get(modal) || {};
        const shouldFocus = options.focus !== undefined ? options.focus : config.focus !== false;
        const onOpenCallback = options.onOpen ?? config.onOpen;

        if (modal.classList.contains('hidden')) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            modal.setAttribute('aria-modal', 'true');
            modalStack.push(modal);
        }

        body.classList.add('modal-open');

        if (shouldFocus) {
            const focusable = modal.querySelector(focusableSelector);
            focusable?.focus();
        }

        if (typeof onOpenCallback === 'function') {
            onOpenCallback();
        }
    }

    function closeModalElement(modal, options = {}) {
        if (!modal || modal.classList.contains('hidden')) return;

        const config = modalCallbacks.get(modal) || {};
        const onCloseCallback = options.onClose ?? config.onClose;

        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');

        const index = modalStack.lastIndexOf(modal);
        if (index > -1) {
            modalStack.splice(index, 1);
        }

        if (modalStack.length === 0) {
            body.classList.remove('modal-open');
        }

        if (typeof onCloseCallback === 'function') {
            onCloseCallback();
        }
    }

    function setupModal(modal, openTriggers = [], closeTriggers = [], config = {}) {
        if (!modal) return;

        const normalizedConfig = {
            onOpen: config.onOpen,
            onClose: config.onClose,
            focus: config.focus !== undefined ? config.focus : true
        };

        modalCallbacks.set(modal, normalizedConfig);

        modal.setAttribute('aria-hidden', modal.classList.contains('hidden') ? 'true' : 'false');

        const openHandler = (event) => {
            event?.preventDefault();
            openModalElement(modal);
        };

        const closeHandler = (event) => {
            event?.preventDefault();
            closeModalElement(modal);
        };

        openTriggers.forEach(trigger => {
            if (!trigger) return;
            trigger.addEventListener('click', openHandler);
        });

        closeTriggers.forEach(trigger => {
            if (!trigger) return;
            trigger.addEventListener('click', closeHandler);
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModalElement(modal);
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const lastModal = modalStack[modalStack.length - 1];
            if (lastModal) {
                closeModalElement(lastModal);
            }
        }
    });

    document.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.info-modal, .modal, .modal-container');
            if (modal) {
                closeModalElement(modal);
            }
        });
    });

    function initMobileNav() {
        const navToggle = elements.mobileNavToggle;
        const navWrapper = elements.primaryNavigation;

        if (!navToggle || !navWrapper) return;

        const setNavState = (isVisible) => {
            navWrapper.setAttribute('data-visible', String(isVisible));
            navToggle.setAttribute('aria-expanded', String(isVisible));
            navToggle.classList.toggle('is-active', isVisible);

            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isVisible);
                icon.classList.toggle('fa-times', isVisible);
            }
        };

        setNavState(navWrapper.getAttribute('data-visible') === 'true');

        navToggle.addEventListener('click', () => {
            const currentVisible = navWrapper.getAttribute('data-visible') === 'true';
            setNavState(!currentVisible);
        });

        navWrapper.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setNavState(false));
        });
    }

    function initDiscoverMore() {
        const trigger = elements.discoverMoreTrigger;
        const content = elements.expandedContent;

        if (!trigger || !content) return;

        const labelSpan = trigger.querySelector('span');
        const initialVisible = content.classList.contains('is-visible');

        content.setAttribute('aria-hidden', String(!initialVisible));
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-expanded', String(initialVisible));
        trigger.classList.toggle('active', initialVisible);

        const setVisualState = (isVisible) => {
            content.classList.toggle('is-visible', isVisible);
            content.classList.toggle('hidden-content', !isVisible);
            content.classList.toggle('slide-down', isVisible);
            content.setAttribute('aria-hidden', String(!isVisible));
            trigger.setAttribute('aria-expanded', String(isVisible));
            trigger.classList.toggle('active', isVisible);

            if (labelSpan) {
                labelSpan.textContent = isVisible ? 'Mostra meno' : 'Scopri di più';
            }

            const arrow = trigger.querySelector('.arrow-down');
            if (arrow) {
                arrow.style.transform = isVisible ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        };

        setVisualState(initialVisible);

        const toggle = () => {
            setVisualState(!content.classList.contains('is-visible'));
        };

        trigger.addEventListener('click', toggle);
        trigger.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggle();
            }
        });
    }

    function initScrollTop() {
        const scrollTopBtn = elements.scrollTopBtn;
        if (!scrollTopBtn) return;

        const toggleVisibility = () => {
            const shouldShow = window.scrollY > 450;
            scrollTopBtn.classList.toggle('is-visible', shouldShow);
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
            });
        });
    }

    function setShareButtonTemporaryLabel(labelHtml, timeout = 2000) {
        const button = elements.shareInstagramBtn;
        if (!button) return;

        if (!button.dataset.originalLabel) {
            button.dataset.originalLabel = button.innerHTML;
        }

        button.innerHTML = labelHtml;

        if (button._shareLabelTimeout) {
            clearTimeout(button._shareLabelTimeout);
        }

        button._shareLabelTimeout = setTimeout(() => {
            button.innerHTML = button.dataset.originalLabel;
        }, timeout);
    }

    function showShareFallback(url) {
        const fallback = elements.shareFallback;
        const shareInput = elements.shareLinkInput;
        const shareUrl = url || window.location.href;

        if (shareInput) {
            shareInput.value = shareUrl;
        }

        if (fallback) {
            fallback.classList.remove('hidden');
            fallback.classList.add('active');
        }

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                if (elements.copyFeedback) {
                    elements.copyFeedback.textContent = 'Link copiato negli appunti!';
                    clearTimeout(copyTimeoutId);
                    copyTimeoutId = setTimeout(() => {
                        elements.copyFeedback.textContent = '';
                    }, 2500);
                }
                setShareButtonTemporaryLabel('<i class="fas fa-check"></i> Link copiato!');
            }).catch(() => {
                setShareButtonTemporaryLabel('<i class="fas fa-share-alt"></i> Condividi');
            });
        }
    }

    function initShareFeatures() {
        const shareBtn = elements.shareInstagramBtn;
        const shareInput = elements.shareLinkInput;

        if (shareBtn) {
            shareBtn.addEventListener('click', async (event) => {
                event.preventDefault();

                const shareUrl = (shareInput?.value?.trim()) || window.location.href;
                const shareData = {
                    title: 'TheItalianPoetry',
                    text: 'Scopri la community di scrittura creativa! ✍️📖 #Poesia #ScritturaCreativa',
                    url: shareUrl
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                        return;
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            return;
                        }
                    }
                }

                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                if (isMobile) {
                    try {
                        window.location.href = `instagram://library?AssetPath=${encodeURIComponent(shareUrl)}`;
                    } catch {
                        // Ignora, continueremo con il fallback
                    }
                }

                showShareFallback(shareUrl);
            });
        }

        if (elements.copyLinkBtn && shareInput) {
            elements.copyLinkBtn.addEventListener('click', async () => {
                const textToCopy = shareInput.value;
                if (!textToCopy) return;

                try {
                    await navigator.clipboard.writeText(textToCopy);
                    if (elements.copyFeedback) {
                        elements.copyFeedback.textContent = 'Copiato negli appunti!';
                        clearTimeout(copyTimeoutId);
                        copyTimeoutId = setTimeout(() => {
                            elements.copyFeedback.textContent = '';
                        }, 2500);
                    }
                    setShareButtonTemporaryLabel('<i class="fas fa-check"></i> Link copiato!');
                } catch {
                    if (elements.copyFeedback) {
                        elements.copyFeedback.textContent = 'Impossibile copiare automaticamente, copia manualmente.';
                        clearTimeout(copyTimeoutId);
                        copyTimeoutId = setTimeout(() => {
                            elements.copyFeedback.textContent = '';
                        }, 3500);
                    }
                }
            });
        }
    }

    function initPoetryWidget() {
        const toggle = document.getElementById('poetry-widget-toggle');
        const overlay = document.getElementById('poetry-widget-overlay');
        const closeBtn = document.getElementById('poetry-widget-close');

        if (!toggle && !overlay && !closeBtn) return;

        const getHeaderHeight = () => {
            const header =
                document.querySelector('header') ||
                document.querySelector('.site-header') ||
                document.getElementById('header');

            return header ? header.offsetHeight : 0;
        };

        const openWidget = () => {
            if (!overlay) return;
            overlay.style.top = `${getHeaderHeight()}px`;
            overlay.classList.remove('hidden');
            body.classList.add('widget-open');
        };

        const closeWidget = () => {
            if (!overlay) return;
            overlay.classList.add('hidden');
            body.classList.remove('widget-open');
        };

        toggle?.addEventListener('click', (event) => {
            event.preventDefault();
            openWidget();
        });

        closeBtn?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeWidget();
        });

        overlay?.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeWidget();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
                closeWidget();
            }
        });
    }

    if (elements.footerParagraph) {
        elements.footerParagraph.innerHTML = elements.footerParagraph.innerHTML.replace(/\b\d{4}\b/, new Date().getFullYear().toString());
    }

    initMobileNav();
    initDiscoverMore();
    initScrollTop();
    initShareFeatures();
    initPoetryWidget();

    // ========= Conto alla rovescia fine mese =========
    function startMonthlyCountdown() {
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');

        if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

        function updateCountdown() {
            const now = new Date();
            const endOfMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                1,
                0, 0, 0
            );

            const diff = endOfMonth - now;
            if (diff <= 0) return;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    startMonthlyCountdown();

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

    // ========= 7. GESTIONE MODALI =========
    setupModal(elements.submissionModal, [elements.openSubmissionModalBtn], [elements.closeSubmissionModalBtn]);
    setupModal(elements.votingModal, [], [elements.closeVotingModalBtn], { onClose: resetVotingModalState });
    setupModal(elements.howToModal, [elements.howToLink, elements.sidebarParticipateBtn], [elements.closeHowToModalBtn]);
    setupModal(elements.aboutUsModal, [elements.aboutUsLink], [elements.closeAboutUsModalBtn]);
    setupModal(elements.authorModal, [elements.authorLink], [elements.closeAuthorModalBtn]);

    // Gestione pulsante "Come Partecipare" -> Invio poesia
    if (elements.howToSubmitBtn) {
        elements.howToSubmitBtn.addEventListener('click', async () => {
            closeModalElement(elements.howToModal);
            
            const { data: { session } } = await supabaseClient.auth.getSession();
            
            if (session) {
                openModalElement(elements.submissionModal);
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
                    closeModalElement(elements.submissionModal);
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
                poemInfo.addEventListener('click', async () => {
                    console.log(`Mostra dettaglio poesia ${poemId}`);

                    // 👉 TRACK LETTURA CLASSIFICA PRINCIPALE
                    await trackInteraction({
                        action: 'read',
                        poemId,
                        weight: 1
                    });

                    // eventuale apertura modale / dettaglio
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
        const votePoemContent = document.getElementById('vote-poem-content');

        if (votePoemTitle) votePoemTitle.textContent = poemData.title;
        if (votePoemAuthor) votePoemAuthor.textContent = `di ${poemData.author_name}`;
        if (votePoemContent) votePoemContent.textContent = poemData.content || '';
        if (elements.votePoemIdInput) elements.votePoemIdInput.value = poemData.id;

        highlightStars(currentRating);

        openModalElement(elements.votingModal, { focus: true });
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
            if (index < rating) {
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            } else {
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
        });
    }

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
    
    setupStarRating();

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
                const payload = { poem_id: poemId, rating: currentRating };
                
                const { error } = await supabaseClient.functions.invoke('invia-voto', {
                    body: payload
                });
                
                if (error) {
                    throw new Error(`Errore Edge Function: ${error.message}`);
                }

                // ✅ TRACK VOTO PER CLASSIFICA INTELLIGENTE
                await trackInteraction({
                    action: 'vote',
                    poemId,
                    weight: 5
                });

                document.cookie = `voted-poem-${poemId}=true; max-age=31536000; path=/`;
                
                if (elements.voteMessage) {
                    elements.voteMessage.textContent = 'Grazie per aver votato!';
                    elements.voteMessage.style.color = 'green';
                }
                
                await caricaDatiIniziali();
                
                setTimeout(() => {
                    closeModalElement(elements.votingModal);
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
