/**
 * =============================================================================
 * POKÉDEX EXPLORER - MAIN APPLICATION CONTROLLER (app.js)
 * =============================================================================
 * Orchestrates application lifecycle using jQuery ($), ES6 standards, and modules:
 * 1. AppUtils: Reusable Debounce (4000ms), Throttle (500ms), escapeHtml, formatId.
 * 2. AppAPI: Cascading 3-Endpoint JOIN (/pokemon -> /pokemon-species -> /evolution-chain).
 * 3. AppUI: jQuery responsive grid rendering and unified modal dossier.
 * =============================================================================
 */

(function (window, $) {
    'use strict';

    const { debounce, throttle } = window.AppUtils;
    const { fetchPokemonPage, fetchChainedPokemonDetails, fetchPokemonBatch } = window.AppAPI;
    const { renderPokemonCards, openPokemonDetailModal, closeModal, showErrorState, updatePagination } = window.AppUI;

    // Application state
    const state = {
        searchQuery: '',
        currentPage: 1,
        totalPages: 1,
        currentItems: [],
        isLoading: false
    };

    // Live countdown timer tracker (4.0s -> 0.0s)
    let countdownIntervalId = null;

    // =========================================================================
    // INITIALIZATION ON DOM READY
    // =========================================================================
    $(document).ready(() => {
        initializeTheme();
        bindEventListeners();
        loadPokemonData();
    });

    // =========================================================================
    // THEME MANAGEMENT (LIGHT / DARK)
    // =========================================================================
    function initializeTheme() {
        const isDark = $('html').hasClass('dark');
        updateThemeIcon(isDark);

        $('#btn-theme-toggle').on('click', () => {
            const currentlyDark = $('html').hasClass('dark');
            if (currentlyDark) {
                $('html').removeClass('dark');
                localStorage.setItem('theme-p2', 'light');
                updateThemeIcon(false);
            } else {
                $('html').addClass('dark');
                localStorage.setItem('theme-p2', 'dark');
                updateThemeIcon(true);
            }
        });
    }

    function updateThemeIcon(isDark) {
        const $icon = $('#theme-icon');
        if (isDark) {
            $icon.attr('class', 'fa-solid fa-sun text-sm text-amber-400');
        } else {
            $icon.attr('class', 'fa-solid fa-moon text-sm text-indigo-600');
        }
    }

    // =========================================================================
    // 4-SECOND COUNTDOWN & PROGRESS BAR ANIMATION
    // =========================================================================
    function startCountdownAnimation() {
        stopCountdownAnimation();

        const $countdownCard = $('#animacion-carga-4s');
        const $countdownText = $('#countdown-text');
        const $progressBar = $('#progress-bar-4s');

        $('#contenedor-cards').addClass('hidden');
        $countdownCard.removeClass('hidden');

        const totalDurationMs = 4000;
        const intervalMs = 50;
        let elapsedMs = 0;

        $countdownText.text('4.0s');
        $progressBar.css('width', '0%');

        countdownIntervalId = setInterval(() => {
            elapsedMs += intervalMs;
            const progressPct = Math.min((elapsedMs / totalDurationMs) * 100, 100);
            const remainingSec = Math.max((totalDurationMs - elapsedMs) / 1000, 0);

            $countdownText.text(`${remainingSec.toFixed(1)}s`);
            $progressBar.css('width', `${progressPct}%`);

            if (elapsedMs >= totalDurationMs) {
                stopCountdownAnimation();
            }
        }, intervalMs);
    }

    function stopCountdownAnimation() {
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
        $('#animacion-carga-4s').addClass('hidden');
    }

    // =========================================================================
    // SEARCH WITH DEBOUNCE (4 SECONDS DELAY)
    // =========================================================================
    
    // Core function executed when the 4000ms debounce timer elapses
    function executeDebouncedSearch() {
        stopCountdownAnimation();
        state.currentPage = 1;
        loadPokemonData();
    }

    // Wrap with the formal debounce utility (4000ms)
    const debouncedSearchHandler = debounce(() => {
        executeDebouncedSearch();
    }, 4000);

    // =========================================================================
    // EVENT LISTENERS CONFIGURATION (JQUERY)
    // =========================================================================
    function bindEventListeners() {
        // 1. Search Input with 4-Second Debounce & Live Animation
        $('#input-busqueda').on('input', function () {
            const query = $(this).val().trim();
            state.searchQuery = query;

            // Toggle clear button
            $('#btn-limpiar-busqueda').toggleClass('hidden', query.length === 0);

            // Start countdown animation while debounce timer waits
            startCountdownAnimation();

            // Trigger debounced search (executes 4000ms after user stops typing)
            debouncedSearchHandler();
        });

        // Search immediately on Enter (cancels pending debounce timer)
        $('#input-busqueda').on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                debouncedSearchHandler.cancel();
                stopCountdownAnimation();
                state.currentPage = 1;
                loadPokemonData();
            }
        });

        // Clear Search Button
        $('#btn-limpiar-busqueda').on('click', () => {
            $('#input-busqueda').val('');
            state.searchQuery = '';
            $('#btn-limpiar-busqueda').addClass('hidden');
            debouncedSearchHandler.cancel();
            stopCountdownAnimation();
            state.currentPage = 1;
            loadPokemonData();
        });

        // 2. Reload Button protected with Throttle (600ms)
        const throttledReload = throttle(() => {
            loadPokemonData();
        }, 600);
        $('#btn-recargar-api').on('click', throttledReload);

        // 3. Pagination Controls protected with Throttle (500ms)
        const throttledPrevPage = throttle(() => {
            if (state.currentPage > 1) {
                state.currentPage--;
                loadPokemonData();
            }
        }, 500);

        const throttledNextPage = throttle(() => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                loadPokemonData();
            }
        }, 500);

        $('#btn-pag-prev').on('click', throttledPrevPage);
        $('#btn-pag-next').on('click', throttledNextPage);

        // 4. Modal Dismiss Handlers
        $('#btn-cerrar-modal, #btn-modal-entendido, #backdrop-modal').on('click', closeModal);
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // =========================================================================
    // DATA LOADING FLOW (CHAINED 3-ENDPOINT JOIN)
    // =========================================================================
    async function loadPokemonData() {
        const $statusText = $('#texto-status-peticion');
        $statusText.text('Fetching PokéAPI data...').attr('class', 'font-mono text-[11px] text-amber-500 font-semibold');

        try {
            // Direct search by query (name or ID)
            if (state.searchQuery) {
                const singlePokemonJoined = await fetchChainedPokemonDetails(state.searchQuery);
                state.currentItems = [singlePokemonJoined];
                state.totalPages = 1;
                state.currentPage = 1;

                updatePagination(1, 1, 1);
                renderPokemonCards(state.currentItems, (pokemon) => {
                    openPokemonDetailModal(pokemon);
                });

                $statusText.text('HTTP 200 OK').attr('class', 'font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold');
                return;
            }

            // Paginated list (24 Pokémon per page)
            const limit = 24;
            const pageData = await fetchPokemonPage(state.currentPage, limit);
            state.totalPages = Math.ceil(pageData.count / limit);

            // Fetch basic details for grid cards
            const pokemonList = await fetchPokemonBatch(pageData.results);
            state.currentItems = pokemonList;

            updatePagination(state.currentPage, state.totalPages, pageData.count);

            // Render cards with click handler triggering the 3-endpoint cascade
            renderPokemonCards(state.currentItems, async (pokemon) => {
                try {
                    // Execute 3-endpoint JOIN: /pokemon -> /pokemon-species -> /evolution-chain
                    const joinedPokemon = await fetchChainedPokemonDetails(pokemon.id);
                    openPokemonDetailModal(joinedPokemon);
                } catch (err) {
                    console.warn('Failed to load full 3-endpoint chain, fallback to card data:', err);
                    openPokemonDetailModal(pokemon);
                }
            });

            $statusText.text('HTTP 200 OK').attr('class', 'font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold');

        } catch (error) {
            console.error('PokéAPI fetching error:', error);
            showErrorState(error.message);
            $statusText.text('HTTP 404 / Not Found').attr('class', 'font-mono text-[11px] text-rose-500 font-semibold');
        }
    }

})(window, window.jQuery);
