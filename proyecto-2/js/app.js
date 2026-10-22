/**
 * =============================================================================
 * MULTIVERSE EXPLORER - MAIN APPLICATION CONTROLLER (app.js)
 * =============================================================================
 * Orchestrates application lifecycle using jQuery ($), ES6 standards, and modules:
 * 1. AppUtils (debounce 4000ms, throttle 600ms, escapeHtml, formatId)
 * 2. AppAPI (3-endpoint chained PokéAPI join + Rick & Morty endpoints)
 * 3. AppUI (jQuery card generation, responsive tables, modal detail view)
 * =============================================================================
 */

(function (window, $) {
    'use strict';

    const { debounce, throttle } = window.AppUtils;
    const { 
        fetchPokemonPage, 
        fetchChainedPokemonDetails, 
        fetchPokemonBatch, 
        fetchRickCharacters, 
        fetchRickLocations, 
        fetchRickEpisodes 
    } = window.AppAPI;
    const { 
        renderPokemonCards, 
        renderRickCharacters, 
        renderLocationsTable, 
        renderEpisodesTable, 
        openPokemonDetailModal, 
        openRickDetailModal, 
        closeModal, 
        showErrorState, 
        updatePagination 
    } = window.AppUI;

    // =========================================================================
    // APPLICATION STATE
    // =========================================================================
    const state = {
        activeApi: 'rick',       // 'rick' | 'poke'
        activeRickSubtab: 'characters', // 'characters' | 'locations' | 'episodes'
        searchQuery: '',
        statusFilter: '',
        currentPage: 1,
        totalPages: 1,
        currentItems: [],
        isLoading: false
    };

    // Countdown animation tracking for 4-second delay
    let countdownIntervalId = null;

    // =========================================================================
    // INITIALIZATION ON DOM READY
    // =========================================================================
    $(document).ready(() => {
        initializeTheme();
        bindEventListeners();
        loadData();
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
    function startCountdownAnimation(onComplete) {
        stopCountdownAnimation();

        const $countdownCard = $('#animacion-carga-4s');
        const $countdownText = $('#countdown-text');
        const $progressBar = $('#progress-bar-4s');

        $('#contenedor-cards').addClass('hidden');
        $('#contenedor-tabla-responsiva').addClass('hidden');
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
                if (typeof onComplete === 'function') onComplete();
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
    
    // Core function executed once the 4000ms debounce fires
    function executeDebouncedSearch() {
        state.currentPage = 1;
        loadData();
    }

    // Wrap with the formal debounce helper (4000ms delay)
    const debouncedSearchHandler = debounce(() => {
        executeDebouncedSearch();
    }, 4000);

    // =========================================================================
    // EVENT LISTENERS CONFIGURATION (JQUERY)
    // =========================================================================
    function bindEventListeners() {
        // 1. API Switcher
        $('#btn-api-rick').on('click', () => switchMainApi('rick'));
        $('#btn-api-poke').on('click', () => switchMainApi('poke'));

        // 2. Rick & Morty Subtabs
        $('.btn-subtab').on('click', function () {
            $('.btn-subtab').removeClass('active bg-emerald-600 text-white')
                            .addClass('text-slate-600 dark:text-slate-400');
            $(this).addClass('active bg-emerald-600 text-white')
                   .removeClass('text-slate-600 dark:text-slate-400');

            state.activeRickSubtab = $(this).data('view');
            state.currentPage = 1;
            loadData();
        });

        // 3. Search Input with 4-Second Debounce & Live Animation
        $('#input-busqueda').on('input', function () {
            const query = $(this).val().trim();
            state.searchQuery = query;

            // Toggle clear button
            $('#btn-limpiar-busqueda').toggleClass('hidden', query.length === 0);

            // Start live countdown animation while debounce timer waits
            startCountdownAnimation(() => {
                // Animation finishes at 4.0s
            });

            // Trigger debounced search (fires 4000ms after user stops typing)
            debouncedSearchHandler();
        });

        // Search immediately on Enter (cancels pending debounce timer)
        $('#input-busqueda').on('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                debouncedSearchHandler.cancel();
                stopCountdownAnimation();
                state.currentPage = 1;
                loadData();
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
            loadData();
        });

        // 4. Status Filter (Alive, Dead, Unknown)
        $('#select-filtro-estado').on('change', function () {
            state.statusFilter = $(this).val();
            state.currentPage = 1;
            loadData();
        });

        // 5. Reload button protected with Throttle (600ms)
        const throttledReload = throttle(() => {
            loadData();
        }, 600);
        $('#btn-recargar-api').on('click', throttledReload);

        // 6. Pagination buttons protected with Throttle (500ms)
        const throttledPrevPage = throttle(() => {
            if (state.currentPage > 1) {
                state.currentPage--;
                loadData();
            }
        }, 500);

        const throttledNextPage = throttle(() => {
            if (state.currentPage < state.totalPages) {
                state.currentPage++;
                loadData();
            }
        }, 500);

        $('#btn-pag-prev').on('click', throttledPrevPage);
        $('#btn-pag-next').on('click', throttledNextPage);

        // 7. Modal Dismiss Handlers
        $('#btn-cerrar-modal, #btn-modal-entendido, #backdrop-modal').on('click', closeModal);
        $(document).on('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // =========================================================================
    // API SWITCHING LOGIC
    // =========================================================================
    function switchMainApi(api) {
        if (state.activeApi === api) return;
        state.activeApi = api;
        state.currentPage = 1;
        state.searchQuery = '';
        $('#input-busqueda').val('');
        $('#btn-limpiar-busqueda').addClass('hidden');

        const $btnRick = $('#btn-api-rick');
        const $btnPoke = $('#btn-api-poke');
        const $brandAvatar = $('#brand-avatar');
        const $brandIcon = $('#brand-icon');
        const $brandDot = $('#brand-dot');
        const $heroBadgeTitle = $('#hero-badge-title');
        const $heroTitle = $('#hero-title');
        const $heroDesc = $('#hero-desc');
        const $endpointChips = $('#endpoint-chips');
        const $tabsRickContainer = $('#tabs-rick-container');
        const $statusFilterContainer = $('#contenedor-filtro-estado');
        const $searchInput = $('#input-busqueda');

        if (api === 'rick') {
            $btnRick.attr('class', 'btn-api-switch active px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400');
            $btnPoke.attr('class', 'btn-api-switch px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer');

            $brandAvatar.attr('class', 'w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/30 transform hover:scale-105 transition-transform');
            $brandIcon.attr('class', 'fa-solid fa-atom text-white text-xl');
            $brandDot.text('RickMorty').attr('class', 'text-emerald-500');

            $heroBadgeTitle.text('Rick & Morty API (3 Endpoints)');
            $heroTitle.text('Multiverse Entity Explorer');
            $heroDesc.html('Asynchronous consumption with jQuery & modular JavaScript. Consumes 3 official endpoints: <strong>/character</strong> (Cards), <strong>/location</strong> (Contained Table), and <strong>/episode</strong> (Contained Table).');

            $endpointChips.html(`
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /character</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /location</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /episode</span>
                </div>
            `);

            $tabsRickContainer.removeClass('hidden');
            $statusFilterContainer.removeClass('hidden');
            $searchInput.attr('placeholder', 'Search characters, locations, or episodes...');

        } else {
            // PokéAPI Mode
            $btnPoke.attr('class', 'btn-api-switch active px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400');
            $btnRick.attr('class', 'btn-api-switch px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer');

            $brandAvatar.attr('class', 'w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/25 ring-1 ring-white/30 transform hover:scale-105 transition-transform');
            $brandIcon.attr('class', 'fa-solid fa-gamepad text-white text-xl');
            $brandDot.text('PokéAPI').attr('class', 'text-rose-500');

            $heroBadgeTitle.text('PokéAPI (3 Chained Endpoints JOIN)');
            $heroTitle.text('National Pokédex with Chained Architecture');
            $heroDesc.html('Advanced cascading consumption chaining 3 endpoints: <strong>/pokemon</strong> (base data) &rarr; <strong>/pokemon-species</strong> (lore & habitat) &rarr; <strong>/evolution-chain</strong> (stages tree).');

            $endpointChips.html(`
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">1. GET /pokemon</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">2. GET /pokemon-species</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                    <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">3. GET /evolution-chain</span>
                </div>
            `);

            $tabsRickContainer.addClass('hidden');
            $statusFilterContainer.addClass('hidden');
            $searchInput.attr('placeholder', 'Search Pokémon by name or ID (e.g. pikachu, charizard, 25)...');
        }

        loadData();
    }

    // =========================================================================
    // MAIN DATA LOADING DISPATCHER
    // =========================================================================
    async function loadData() {
        const $statusText = $('#texto-status-peticion');
        $statusText.text('Fetching data...').attr('class', 'font-mono text-[11px] text-amber-500 font-semibold');

        try {
            if (state.activeApi === 'rick') {
                await loadRickData();
            } else {
                await loadPokemonData();
            }
            $statusText.text('HTTP 200 OK').attr('class', 'font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold');
        } catch (error) {
            console.error('Data fetching error:', error);
            showErrorState(error.message);
            $statusText.text('HTTP 404 / Error').attr('class', 'font-mono text-[11px] text-rose-500 font-semibold');
        }
    }

    // =========================================================================
    // RICK & MORTY DATA FLOW
    // =========================================================================
    async function loadRickData() {
        let data;
        if (state.activeRickSubtab === 'characters') {
            $('#label-subview-info').text('Endpoint 1 of 3: GET /api/character');
            data = await fetchRickCharacters(state.currentPage, state.searchQuery, state.statusFilter);
            state.currentItems = data.results || [];
            state.totalPages = data.info ? data.info.pages : 1;

            updatePagination(state.currentPage, state.totalPages, data.info ? data.info.count : state.currentItems.length);
            renderRickCharacters(state.currentItems, (character) => {
                openRickDetailModal(character);
            });

        } else if (state.activeRickSubtab === 'locations') {
            $('#label-subview-info').text('Endpoint 2 of 3: GET /api/location');
            data = await fetchRickLocations(state.currentPage, state.searchQuery);
            state.currentItems = data.results || [];
            state.totalPages = data.info ? data.info.pages : 1;

            updatePagination(state.currentPage, state.totalPages, data.info ? data.info.count : state.currentItems.length);
            renderLocationsTable(state.currentItems);

        } else if (state.activeRickSubtab === 'episodes') {
            $('#label-subview-info').text('Endpoint 3 of 3: GET /api/episode');
            data = await fetchRickEpisodes(state.currentPage, state.searchQuery);
            state.currentItems = data.results || [];
            state.totalPages = data.info ? data.info.pages : 1;

            updatePagination(state.currentPage, state.totalPages, data.info ? data.info.count : state.currentItems.length);
            renderEpisodesTable(state.currentItems);
        }
    }

    // =========================================================================
    // POKÉAPI DATA FLOW (CHAINED 3-ENDPOINT JOIN)
    // =========================================================================
    async function loadPokemonData() {
        // Direct search by query (name or ID)
        if (state.searchQuery) {
            const singlePokemonJoined = await fetchChainedPokemonDetails(state.searchQuery);
            state.currentItems = [singlePokemonJoined];
            state.totalPages = 1;
            state.currentPage = 1;

            updatePagination(1, 1, 1);
            renderPokemonCards(state.currentItems, async (pokemon) => {
                openPokemonDetailModal(pokemon);
            });
            return;
        }

        // Paginated list
        const limit = 24;
        const pageData = await fetchPokemonPage(state.currentPage, limit);
        state.totalPages = Math.ceil(pageData.count / limit);

        // Fetch basic details for cards
        const pokemonList = await fetchPokemonBatch(pageData.results);
        state.currentItems = pokemonList;

        updatePagination(state.currentPage, state.totalPages, pageData.count);

        renderPokemonCards(state.currentItems, async (pokemon) => {
            // When a user clicks any Pokémon card, trigger the 3-endpoint chain
            try {
                const joinedPokemon = await fetchChainedPokemonDetails(pokemon.id);
                openPokemonDetailModal(joinedPokemon);
            } catch (err) {
                console.warn('Failed to load full 3-endpoint details, using base card data:', err);
                openPokemonDetailModal(pokemon);
            }
        });
    }

})(window, window.jQuery);
