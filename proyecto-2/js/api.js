/**
 * =============================================================================
 * MULTIVERSE EXPLORER - API MODULE (api.js)
 * =============================================================================
 * Handles all asynchronous HTTP requests for both external APIs:
 * 1. Rick and Morty API (3 endpoints: /character, /location, /episode)
 * 2. PokéAPI with Chained 3-Endpoint "JOIN":
 *    - Step 1: GET /pokemon/{id_or_name}
 *    - Step 2: GET /pokemon-species/{id} (using species.url from Step 1)
 *    - Step 3: GET /evolution-chain/{id} (using evolution_chain.url from Step 2)
 * =============================================================================
 */

(function (window) {
    'use strict';

    const RICK_API_BASE = 'https://rickandmortyapi.com/api';
    const POKE_API_BASE = 'https://pokeapi.co/api/v2';

    /**
     * Extracts numeric ID from a PokéAPI resource URL.
     * Example: "https://pokeapi.co/api/v2/pokemon-species/25/" -> 25
     */
    function extractIdFromUrl(url) {
        if (!url) return null;
        const matches = url.match(/\/(\d+)\/?$/);
        return matches ? parseInt(matches[1], 10) : null;
    }

    /**
     * Recursively traverses PokéAPI evolution chain structure
     * into a flat array of evolution stages.
     */
    function parseEvolutionChain(chainNode, evolutionList = []) {
        if (!chainNode || !chainNode.species) return evolutionList;

        const speciesName = chainNode.species.name;
        const speciesId = extractIdFromUrl(chainNode.species.url);
        
        let minLevel = null;
        let triggerName = 'Base Stage';

        if (chainNode.evolution_details && chainNode.evolution_details.length > 0) {
            const details = chainNode.evolution_details[0];
            minLevel = details.min_level || null;
            if (details.trigger) {
                triggerName = details.trigger.name.replace(/-/g, ' ');
            }
            if (details.item) {
                triggerName += ` (${details.item.name.replace(/-/g, ' ')})`;
            }
        }

        evolutionList.push({
            name: speciesName,
            id: speciesId,
            sprite: speciesId
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`
                : null,
            minLevel: minLevel,
            trigger: triggerName
        });

        if (Array.isArray(chainNode.evolves_to)) {
            chainNode.evolves_to.forEach(childNode => {
                parseEvolutionChain(childNode, evolutionList);
            });
        }

        return evolutionList;
    }

    // =========================================================================
    // POKÉAPI - 3-ENDPOINT CHAINED "JOIN" IMPLEMENTATION
    // =========================================================================

    /**
     * Fetches a paginated list of basic Pokémon.
     */
    async function fetchPokemonPage(page = 1, limit = 24) {
        const offset = (page - 1) * limit;
        const url = `${POKE_API_BASE}/pokemon?limit=${limit}&offset=${offset}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load Pokémon list (HTTP ${response.status})`);
        }
        return await response.json();
    }

    /**
     * Executes chained 3-endpoint request ("JOIN" pattern):
     * 1. GET /pokemon/{id_or_name}
     * 2. GET /pokemon-species/{id}
     * 3. GET /evolution-chain/{id}
     *
     * @param {string|number} identifier - Pokémon name or ID.
     * @returns {Promise<Object>} Unified data object joining all 3 endpoints.
     */
    async function fetchChainedPokemonDetails(identifier) {
        const query = String(identifier).trim().toLowerCase();

        // ---------------------------------------------------------------------
        // STEP 1: Fetch Base Pokémon details
        // ---------------------------------------------------------------------
        const pokemonRes = await fetch(`${POKE_API_BASE}/pokemon/${encodeURIComponent(query)}`);
        if (!pokemonRes.ok) {
            throw new Error(`Pokémon "${identifier}" not found in PokéAPI.`);
        }
        const pokemonData = await pokemonRes.json();

        // Check if species URL is available to initiate the chain
        const speciesUrl = pokemonData.species && pokemonData.species.url;
        let speciesData = null;
        let evolutionChainData = null;
        let parsedEvolutions = [];

        if (speciesUrl) {
            try {
                // -------------------------------------------------------------
                // STEP 2: Fetch Pokémon Species info (chained from Step 1)
                // -------------------------------------------------------------
                const speciesRes = await fetch(speciesUrl);
                if (speciesRes.ok) {
                    speciesData = await speciesRes.json();

                    // Extract English description flavor text
                    let description = 'No Pokédex description available.';
                    if (Array.isArray(speciesData.flavor_text_entries)) {
                        const englishEntry = speciesData.flavor_text_entries.find(
                            entry => entry.language && entry.language.name === 'en'
                        );
                        if (englishEntry) {
                            description = englishEntry.flavor_text.replace(/[\n\f]/g, ' ');
                        }
                    }

                    // ---------------------------------------------------------
                    // STEP 3: Fetch Evolution Chain info (chained from Step 2)
                    // ---------------------------------------------------------
                    const evoUrl = speciesData.evolution_chain && speciesData.evolution_chain.url;
                    if (evoUrl) {
                        const evoRes = await fetch(evoUrl);
                        if (evoRes.ok) {
                            evolutionChainData = await evoRes.json();
                            parsedEvolutions = parseEvolutionChain(evolutionChainData.chain);
                        }
                    }

                    // Attach structured species info
                    pokemonData.speciesDetails = {
                        description: description,
                        habitat: speciesData.habitat ? speciesData.habitat.name : 'Unknown',
                        color: speciesData.color ? speciesData.color.name : 'Unknown',
                        captureRate: speciesData.capture_rate,
                        baseHappiness: speciesData.base_happiness,
                        growthRate: speciesData.growth_rate ? speciesData.growth_rate.name : 'Normal',
                        generation: speciesData.generation ? speciesData.generation.name.toUpperCase() : 'N/A'
                    };
                }
            } catch (chainErr) {
                console.warn('Could not complete full 3-endpoint chain:', chainErr);
            }
        }

        // Return the merged object (the "JOIN")
        pokemonData.evolutionChain = parsedEvolutions;
        return pokemonData;
    }

    /**
     * Batch-loads multiple Pokémon with primary details for the grid view.
     */
    async function fetchPokemonBatch(resultsList) {
        const promises = resultsList.map(item => fetch(item.url).then(r => r.json()));
        return await Promise.all(promises);
    }

    // =========================================================================
    // RICK AND MORTY API (3 Endpoints)
    // =========================================================================

    async function fetchRickCharacters(page = 1, search = '', status = '') {
        let url = `${RICK_API_BASE}/character/?page=${page}`;
        if (search) url += `&name=${encodeURIComponent(search)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`No characters found matching query (${response.status})`);
        }
        return await response.json();
    }

    async function fetchRickLocations(page = 1, search = '') {
        let url = `${RICK_API_BASE}/location/?page=${page}`;
        if (search) url += `&name=${encodeURIComponent(search)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`No locations found matching query (${response.status})`);
        }
        return await response.json();
    }

    async function fetchRickEpisodes(page = 1, search = '') {
        let url = `${RICK_API_BASE}/episode/?page=${page}`;
        if (search) url += `&name=${encodeURIComponent(search)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`No episodes found matching query (${response.status})`);
        }
        return await response.json();
    }

    // Expose API module on global namespace
    window.AppAPI = {
        // PokéAPI (Chained 3 Endpoints)
        fetchPokemonPage,
        fetchChainedPokemonDetails,
        fetchPokemonBatch,

        // Rick & Morty (3 Endpoints)
        fetchRickCharacters,
        fetchRickLocations,
        fetchRickEpisodes
    };

})(window);
