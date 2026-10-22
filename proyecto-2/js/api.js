/**
 * =============================================================================
 * POKÉDEX EXPLORER - API MODULE (api.js)
 * =============================================================================
 * Handles all asynchronous HTTP requests for PokéAPI with a Cascading
 * 3-Endpoint "JOIN" Architecture:
 * 
 * 1. Step 1: GET https://pokeapi.co/api/v2/pokemon/{id_or_name}
 *    - Base stats, artwork sprites, types, height, weight, and species URL.
 * 2. Step 2: GET https://pokeapi.co/api/v2/pokemon-species/{id}
 *    - Official English Pokédex lore, habitat, color, and evolution chain URL.
 * 3. Step 3: GET https://pokeapi.co/api/v2/evolution-chain/{id}
 *    - Recursive traversal of evolutionary stages with triggers and levels.
 * =============================================================================
 */

(function (window) {
    'use strict';

    const POKE_API_BASE = 'https://pokeapi.co/api/v2';

    /**
     * Extracts numeric ID from a resource URL.
     * Example: "https://pokeapi.co/api/v2/pokemon-species/25/" -> 25
     *
     * @param {string} url - API resource URL.
     * @returns {number|null} Extracted ID.
     */
    function extractIdFromUrl(url) {
        if (!url) return null;
        const matches = url.match(/\/(\d+)\/?$/);
        return matches ? parseInt(matches[1], 10) : null;
    }

    /**
     * Recursively traverses PokéAPI evolution tree into a flat array of stages.
     *
     * @param {Object} chainNode - Current node in evolution tree.
     * @param {Array} evolutionList - Accumulated list of evolution stages.
     * @returns {Array} Array of evolution stages with names, triggers, and sprites.
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
    // PUBLIC API METHODS
    // =========================================================================

    /**
     * Fetches a paginated page of Pokémon headers.
     *
     * @param {number} page - Page number (1-indexed).
     * @param {number} limit - Items per page.
     * @returns {Promise<Object>} Paginated response with count and results array.
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
     * Executes the Cascading 3-Endpoint "JOIN" request:
     * - Endpoint 1: /pokemon/{identifier}
     * - Endpoint 2: /pokemon-species/{id} (chained using species.url)
     * - Endpoint 3: /evolution-chain/{id} (chained using evolution_chain.url)
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

        // Check if species URL is present to continue the chain
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

                    // Extract official English Pokédex description
                    let description = 'No Pokédex description available for this Pokémon.';
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

                    // Attach structured species information
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

        // Return the joined object
        pokemonData.evolutionChain = parsedEvolutions;
        return pokemonData;
    }

    /**
     * Batch-loads multiple Pokémon with primary details for the grid view.
     *
     * @param {Array} resultsList - Array of basic { name, url } objects.
     * @returns {Promise<Array>} Array of detailed Pokémon objects.
     */
    async function fetchPokemonBatch(resultsList) {
        const promises = resultsList.map(item => fetch(item.url).then(r => r.json()));
        return await Promise.all(promises);
    }

    // Expose API module on global namespace
    window.AppAPI = {
        fetchPokemonPage,
        fetchChainedPokemonDetails,
        fetchPokemonBatch
    };

})(window);
