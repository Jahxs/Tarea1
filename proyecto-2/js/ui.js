/**
 * =============================================================================
 * MULTIVERSE EXPLORER - UI MODULE (ui.js)
 * =============================================================================
 * Handles all DOM rendering and modal presentations using jQuery ($):
 * 1. Responsive Card Grid for Pokémon & Rick and Morty
 * 2. Contained, non-overflowing data tables for Locations & Episodes
 * 3. Chained Modal Detail View displaying unified 3-endpoint data
 * =============================================================================
 */

(function (window, $) {
    'use strict';

    const { escapeHtml, formatId } = window.AppUtils;

    /**
     * Determines badge styling for Rick and Morty status.
     */
    function getRickStatusConfig(status) {
        switch (status) {
            case 'Alive':
                return {
                    badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
                    dotClass: 'bg-emerald-500',
                    textClass: 'text-emerald-600 dark:text-emerald-400'
                };
            case 'Dead':
                return {
                    badgeClass: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30',
                    dotClass: 'bg-rose-500',
                    textClass: 'text-rose-600 dark:text-rose-400'
                };
            default:
                return {
                    badgeClass: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30',
                    dotClass: 'bg-slate-400',
                    textClass: 'text-slate-500 dark:text-slate-400'
                };
        }
    }

    // =========================================================================
    // CARDS RENDERING (JQUERY)
    // =========================================================================

    /**
     * Renders responsive Pokémon cards into the grid.
     */
    function renderPokemonCards(pokemonList, onCardClick) {
        const $cardsContainer = $('#contenedor-cards');
        const $tableContainer = $('#contenedor-tabla-responsiva');

        $tableContainer.addClass('hidden');
        $cardsContainer.removeClass('hidden').empty();

        pokemonList.forEach(pokemon => {
            const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default 
                        || pokemon.sprites?.front_default 
                        || '';

            const typesHtml = (pokemon.types || []).map(t => `
                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ${escapeHtml(t.type.name)}
                </span>
            `).join('');

            const formattedId = formatId(pokemon.id, 3);

            const $card = $(`
                <article class="entity-card animate-fade-in group cursor-pointer" data-id="${pokemon.id}">
                    <div class="entity-image-wrapper bg-gradient-to-b from-rose-50/50 to-amber-50/50 dark:from-slate-900 dark:to-slate-950">
                        <img src="${sprite}" alt="${escapeHtml(pokemon.name)}" class="entity-image object-contain p-3" loading="lazy">
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
     * Renders Rick and Morty character cards.
     */
    function renderRickCharacters(characterList, onCardClick) {
        const $cardsContainer = $('#contenedor-cards');
        const $tableContainer = $('#contenedor-tabla-responsiva');

        $tableContainer.addClass('hidden');
        $cardsContainer.removeClass('hidden').empty();

        characterList.forEach(character => {
            const statusConfig = getRickStatusConfig(character.status);
            const $card = $(`
                <article class="entity-card animate-fade-in group cursor-pointer" data-id="${character.id}">
                    <div class="entity-image-wrapper">
                        <img src="${character.image}" alt="${escapeHtml(character.name)}" class="entity-image" loading="lazy">
                        <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusConfig.badgeClass} shadow-md backdrop-blur-md">
                            <span class="w-2 h-2 rounded-full ${statusConfig.dotClass} inline-block mr-1"></span>
                            ${character.status}
                        </span>
                        <span class="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-md">
                            #${character.id}
                        </span>
                    </div>

                    <div class="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
                                ${escapeHtml(character.name)}
                            </h3>
                            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <i class="fa-solid fa-dna text-emerald-500 text-[10px]"></i>
                                <span>${character.species} &bull; ${character.gender}</span>
                            </p>
                        </div>

                        <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1">
                            <div class="text-slate-400">Origin:</div>
                            <div class="font-semibold text-slate-700 dark:text-slate-300 truncate">${escapeHtml(character.origin.name)}</div>
                        </div>

                        <button 
                            type="button" 
                            class="btn-trigger-detail w-full py-2 px-3 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <i class="fa-solid fa-address-card text-xs"></i>
                            <span>View Character Dossier</span>
                        </button>
                    </div>
                </article>
            `);

            $card.on('click', () => {
                if (typeof onCardClick === 'function') onCardClick(character);
            });

            $cardsContainer.append($card);
        });
    }

    // =========================================================================
    // CONTAINED RESPONSIVE TABLES
    // =========================================================================

    function renderLocationsTable(locations) {
        const $cardsContainer = $('#contenedor-cards');
        const $tableContainer = $('#contenedor-tabla-responsiva');
        const $tableHead = $('#tabla-head');
        const $tableBody = $('#tabla-body');

        $cardsContainer.addClass('hidden');
        $tableContainer.removeClass('hidden');

        $('#tabla-titulo-encabezado').text('Multiverse Locations (Endpoint: /api/location)');
        $('#badge-tabla-conteo').text(`${locations.length} locations rendered`);

        $tableHead.html(`
            <tr>
                <th class="px-5 py-3.5">ID</th>
                <th class="px-5 py-3.5">Location Name</th>
                <th class="px-5 py-3.5">Type</th>
                <th class="px-5 py-3.5">Dimension</th>
                <th class="px-5 py-3.5 text-right">Residents</th>
            </tr>
        `);

        $tableBody.empty();
        locations.forEach(loc => {
            $tableBody.append(`
                <tr class="hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors">
                    <td class="px-5 py-3.5 font-mono font-bold text-slate-400">#${loc.id}</td>
                    <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white table-truncate" title="${escapeHtml(loc.name)}">
                        <i class="fa-solid fa-location-dot text-emerald-500 mr-1.5"></i>${escapeHtml(loc.name)}
                    </td>
                    <td class="px-5 py-3.5">
                        <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            ${escapeHtml(loc.type || 'Unknown')}
                        </span>
                    </td>
                    <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400 table-truncate" title="${escapeHtml(loc.dimension)}">
                        ${escapeHtml(loc.dimension)}
                    </td>
                    <td class="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ${loc.residents ? loc.residents.length : 0}
                    </td>
                </tr>
            `);
        });
    }

    function renderEpisodesTable(episodes) {
        const $cardsContainer = $('#contenedor-cards');
        const $tableContainer = $('#contenedor-tabla-responsiva');
        const $tableHead = $('#tabla-head');
        const $tableBody = $('#tabla-body');

        $cardsContainer.addClass('hidden');
        $tableContainer.removeClass('hidden');

        $('#tabla-titulo-encabezado').text('Broadcast Episodes (Endpoint: /api/episode)');
        $('#badge-tabla-conteo').text(`${episodes.length} episodes rendered`);

        $tableHead.html(`
            <tr>
                <th class="px-5 py-3.5">ID</th>
                <th class="px-5 py-3.5">Episode Code</th>
                <th class="px-5 py-3.5">Episode Title</th>
                <th class="px-5 py-3.5">Air Date</th>
                <th class="px-5 py-3.5 text-right">Characters</th>
            </tr>
        `);

        $tableBody.empty();
        episodes.forEach(ep => {
            $tableBody.append(`
                <tr class="hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-colors">
                    <td class="px-5 py-3.5 font-mono font-bold text-slate-400">#${ep.id}</td>
                    <td class="px-5 py-3.5">
                        <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                            ${ep.episode}
                        </span>
                    </td>
                    <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white table-truncate" title="${escapeHtml(ep.name)}">
                        <i class="fa-solid fa-play text-purple-500 mr-1.5 text-[10px]"></i>${escapeHtml(ep.name)}
                    </td>
                    <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        ${escapeHtml(ep.air_date)}
                    </td>
                    <td class="px-5 py-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                        ${ep.characters ? ep.characters.length : 0}
                    </td>
                </tr>
            `);
        });
    }

    // =========================================================================
    // MODAL DETAIL VIEW (3-ENDPOINT JOIN VISUALIZATION)
    // =========================================================================

    /**
     * Renders detailed modal displaying data joined from:
     * 1. /pokemon
     * 2. /pokemon-species
     * 3. /evolution-chain
     */
    function openPokemonDetailModal(pokemon) {
        const sprite = pokemon.sprites?.other?.['official-artwork']?.front_default 
                    || pokemon.sprites?.front_default 
                    || '';

        $('#modal-badge-id').html(`
            <span class="text-rose-600 dark:text-rose-400 font-bold">
                Pokédex ${formatId(pokemon.id, 3)}
            </span> &bull; 
            <span class="text-slate-400 font-normal">3-Endpoint JOIN Chain</span>
        `);

        $('#modal-titulo').text(pokemon.name.toUpperCase());
        $('#modal-imagen').attr({ src: sprite, alt: pokemon.name });

        // Base Stats bars
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

            <!-- Base Combat Stats -->
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

    /**
     * Renders detailed modal for Rick and Morty character.
     */
    function openRickDetailModal(character) {
        const statusConfig = getRickStatusConfig(character.status);

        $('#modal-badge-id').html(`
            <span class="text-emerald-600 dark:text-emerald-400 font-bold">
                ID #${character.id}
            </span> &bull; 
            <span class="text-slate-400 font-normal">Rick & Morty Character Dossier</span>
        `);

        $('#modal-titulo').text(character.name);
        $('#modal-imagen').attr({ src: character.image, alt: character.name });

        $('#modal-descripcion-grid').html(`
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400 block mb-0.5">Vital Status:</span>
                <span class="font-bold ${statusConfig.textClass} flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full ${statusConfig.dotClass}"></span>
                    ${character.status}
                </span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <span class="text-slate-400 block mb-0.5">Species & Gender:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${character.species} (${character.gender})</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2">
                <span class="text-slate-400 block mb-0.5">Origin Location:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHtml(character.origin.name)}</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2">
                <span class="text-slate-400 block mb-0.5">Last Known Location:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHtml(character.location.name)}</span>
            </div>
            <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 col-span-2 text-emerald-600 dark:text-emerald-400">
                <span class="block font-semibold">Featured Episodes:</span>
                <span class="font-extrabold text-base">${character.episode.length} episodes aired</span>
            </div>
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
        const $tableContainer = $('#contenedor-tabla-responsiva');

        $tableContainer.addClass('hidden');
        $cardsContainer.removeClass('hidden').html(`
            <div class="col-span-full py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-2xl">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No Results Found</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">${escapeHtml(message)}</p>
            </div>
        `);
        $('#texto-resumen-resultados').text('0 results found');
    }

    function updatePagination(currentPage, totalPages, totalItems) {
        $('#texto-resumen-resultados').html(`
            Showing <strong class="text-slate-900 dark:text-white">${totalItems}</strong> entries from API
        `);
        $('#texto-pagina-actual').text(`Page ${currentPage} of ${totalPages}`);

        $('#btn-pag-prev').prop('disabled', currentPage <= 1);
        $('#btn-pag-next').prop('disabled', currentPage >= totalPages);
    }

    // Expose UI module on global namespace
    window.AppUI = {
        renderPokemonCards,
        renderRickCharacters,
        renderLocationsTable,
        renderEpisodesTable,
        openPokemonDetailModal,
        openRickDetailModal,
        closeModal,
        showErrorState,
        updatePagination
    };

})(window, window.jQuery);
