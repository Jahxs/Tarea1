/**
 * =============================================================================
 * POKÉDEX EXPLORER - UI MODULE (ui.js)
 * =============================================================================
 * Handles all DOM rendering and modal presentations using jQuery ($):
 * 1. Responsive 3/4-Column Pokémon Card Grid
 * 2. Cascading 3-Endpoint Modal View displaying:
 *    - Base Combat Statistics (Endpoint 1: /pokemon)
 *    - Official Pokédex Lore & Habitat (Endpoint 2: /pokemon-species)
 *    - Complete Evolutionary Tree with Sprites (Endpoint 3: /evolution-chain)
 * =============================================================================
 */

(function (window, $) {
    'use strict';

    const { escapeHtml, formatId } = window.AppUtils;

    // Type color styling dictionary for rich visual aesthetics
    const TYPE_COLORS = {
        normal: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700',
        fire: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        water: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
        grass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        electric: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
        ice: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        fighting: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
        poison: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
        ground: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
        flying: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        psychic: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30',
        bug: 'bg-lime-500/15 text-lime-600 dark:text-lime-400 border-lime-500/30',
        rock: 'bg-amber-700/15 text-amber-700 dark:text-amber-400 border-amber-700/30',
        ghost: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
        dragon: 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border-blue-600/30',
        dark: 'bg-neutral-800/20 text-neutral-800 dark:text-neutral-300 border-neutral-700',
        steel: 'bg-slate-400/20 text-slate-600 dark:text-slate-300 border-slate-400',
        fairy: 'bg-rose-400/15 text-rose-500 dark:text-rose-300 border-rose-400/30'
    };

    /**
     * Renders responsive Pokémon cards into the grid.
     *
     * @param {Array} pokemonList - Array of Pokémon data objects.
     * @param {Function} onCardClick - Callback when card or detail button is triggered.
     */
    function renderPokemonCards(pokemonList, onCardClick) {
        const $cardsContainer = $('#contenedor-cards');
        $cardsContainer.removeClass('hidden').empty();

        pokemonList.forEach(pokemon => {
            const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default 
                        || pokemon.sprites?.front_default 
                        || '';

            const typesHtml = (pokemon.types || []).map(t => {
                const typeName = t.type.name.toLowerCase();
                const colorClasses = TYPE_COLORS[typeName] || 'bg-slate-100 text-slate-700 border-slate-200';
                return `
                    <span class="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colorClasses}">
                        ${escapeHtml(t.type.name)}
                    </span>
                `;
            }).join('');

            const formattedId = formatId(pokemon.id, 3);

            const $card = $(`
                <article class="entity-card animate-fade-in group cursor-pointer" data-id="${pokemon.id}">
                    <div class="entity-image-wrapper bg-gradient-to-b from-rose-50/50 to-amber-50/50 dark:from-slate-900 dark:to-slate-950">
                        <img src="${sprite}" alt="${escapeHtml(pokemon.name)}" class="entity-image object-contain p-3 transition-transform duration-300 group-hover:scale-105" loading="lazy">
                        <span class="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-rose-600 text-white shadow-xs">
                            ${formattedId}
                        </span>
                    </div>

                    <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-extrabold text-base capitalize text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                                ${escapeHtml(pokemon.name)}
                            </h3>
                            <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                ${typesHtml}
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                            <div>
                                <span class="text-slate-400 block">Height:</span>
                                <span class="font-bold text-slate-700 dark:text-slate-300">${(pokemon.height / 10).toFixed(1)} m</span>
                            </div>
                            <div>
                                <span class="text-slate-400 block">Weight:</span>
                                <span class="font-bold text-slate-700 dark:text-slate-300">${(pokemon.weight / 10).toFixed(1)} kg</span>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            class="btn-trigger-detail w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <i class="fa-solid fa-layer-group text-xs"></i>
                            <span>View 3-Endpoint Chain</span>
                        </button>
                    </div>
                </article>
            `);

            $card.on('click', () => {
                if (typeof onCardClick === 'function') onCardClick(pokemon);
            });

            $cardsContainer.append($card);
        });
    }

    /**
     * Renders detailed modal displaying data joined from:
     * 1. /pokemon
     * 2. /pokemon-species
     * 3. /evolution-chain
     *
     * @param {Object} pokemon - Unified 3-endpoint Pokémon object.
     */
    function openPokemonDetailModal(pokemon) {
        const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default 
                    || pokemon.sprites?.front_default 
                    || '';

        $('#modal-badge-id').html(`
            <span class="text-rose-600 dark:text-rose-400 font-bold">
                Pokédex ${formatId(pokemon.id, 3)}
            </span> &bull; 
            <span class="text-slate-400 font-normal">3-Endpoint JOIN Cascade</span>
        `);

        $('#modal-titulo').text(pokemon.name.toUpperCase());
        $('#modal-imagen').attr({ src: sprite, alt: pokemon.name });

        // Base Stats bars (from Endpoint 1)
        const statsHtml = (pokemon.stats || []).map(s => `
            <div class="space-y-1">
                <div class="flex justify-between text-[10px] font-semibold text-slate-400 uppercase">
                    <span>${s.stat.name}</span>
                    <span class="font-bold text-slate-800 dark:text-slate-200">${s.base_stat}</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div class="bg-rose-500 h-full rounded-full" style="width: ${Math.min((s.base_stat / 150) * 100, 100)}%;"></div>
                </div>
            </div>
        `).join('');

        // Species description & characteristics (from Endpoint 2)
        const species = pokemon.speciesDetails || {
            description: 'Species data unavailable.',
            habitat: 'Unknown',
            color: 'Unknown',
            captureRate: 'N/A',
            generation: 'N/A'
        };

        // Evolution chain stages (from Endpoint 3)
        const evolutions = pokemon.evolutionChain || [];
        let evolutionChainHtml = '';

        if (evolutions.length > 0) {
            const stagesHtml = evolutions.map((stage, idx) => `
                <div class="flex items-center gap-2">
                    <div class="flex flex-col items-center p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 min-w-[70px]">
                        <img src="${stage.sprite || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + stage.id + '.png'}" 
                             alt="${stage.name}" 
                             class="w-12 h-12 object-contain"
                             onerror="this.style.display='none'">
                        <span class="text-[10px] font-bold capitalize text-slate-800 dark:text-slate-200">${stage.name}</span>
                        <span class="text-[9px] text-slate-400">${stage.minLevel ? 'Lv. ' + stage.minLevel : stage.trigger}</span>
                    </div>
                    ${idx < evolutions.length - 1 ? '<i class="fa-solid fa-arrow-right text-rose-500 text-xs"></i>' : ''}
                </div>
            `).join('');

            evolutionChainHtml = `
                <div class="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 col-span-2 space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-rose-700 dark:text-rose-400 font-extrabold text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                            <i class="fa-solid fa-diagram-project"></i> Evolution Chain (Endpoint 3: /evolution-chain)
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">${evolutions.length} stages</span>
                    </div>
                    <div class="flex items-center gap-2 overflow-x-auto py-1">
                        ${stagesHtml}
                    </div>
                </div>
            `;
        }

        $('#modal-descripcion-grid').html(`
            <!-- Lore & Description from Species Endpoint -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2">
                <span class="text-slate-400 block mb-0.5 font-bold text-[10px] uppercase">
                    Pokédex Lore (Endpoint 2: /pokemon-species)
                </span>
                <p class="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "${escapeHtml(species.description)}"
                </p>
            </div>

            <!-- Species Attributes -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400 block mb-0.5">Habitat & Color:</span>
                <span class="font-bold capitalize text-slate-800 dark:text-slate-200">
                    ${species.habitat} &bull; ${species.color}
                </span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400 block mb-0.5">Capture Rate:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">
                    ${species.captureRate || 'N/A'} / 255
                </span>
            </div>

            <!-- Physical Attributes from Base Endpoint -->
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400 block mb-0.5">Height:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${(pokemon.height / 10).toFixed(1)} m</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400 block mb-0.5">Weight:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>

            <!-- Base Combat Stats from Endpoint 1 -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2 space-y-2">
                <span class="text-slate-400 block font-bold text-[11px] uppercase tracking-wide">
                    Base Combat Statistics (Endpoint 1: /pokemon)
                </span>
                ${statsHtml}
            </div>

            <!-- Evolution Chain from Endpoint 3 -->
            ${evolutionChainHtml}
        `);

        showModal();
    }

    function showModal() {
        $('#modal-detalle-api').removeClass('hidden');
        $('body').addClass('overflow-hidden');
    }

    function closeModal() {
        $('#modal-detalle-api').addClass('hidden');
        $('body').removeClass('overflow-hidden');
    }

    function showErrorState(message) {
        const $cardsContainer = $('#contenedor-cards');
        $cardsContainer.removeClass('hidden').html(`
            <div class="col-span-full py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-2xl">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Pokémon Found</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">${escapeHtml(message)}</p>
            </div>
        `);
        $('#texto-resumen-resultados').text('0 Pokémon found');
    }

    function updatePagination(currentPage, totalPages, totalItems) {
        $('#texto-resumen-resultados').html(`
            Showing <strong class="text-slate-900 dark:text-white">${totalItems}</strong> entries from PokéAPI
        `);
        $('#texto-pagina-actual').text(`Page ${currentPage} of ${totalPages}`);

        $('#btn-pag-prev').prop('disabled', currentPage <= 1);
        $('#btn-pag-next').prop('disabled', currentPage >= totalPages);
    }

    // Expose UI module on global namespace
    window.AppUI = {
        renderPokemonCards,
        openPokemonDetailModal,
        closeModal,
        showErrorState,
        updatePagination
    };

})(window, window.jQuery);
