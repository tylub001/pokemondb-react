import { API_BASE_URL } from "./config";

const formAliases = {
  lycanroc: "lycanroc-midday",
  lycanroc_midnight: "lycanroc-midnight",
  lycanroc_dusk: "lycanroc-dusk",
};

const speciesAliases = {
  lycanroc: "rockruff",
  lycanroc_midnight: "rockruff",
  lycanroc_dusk: "rockruff",
};

const normalizeName = (name) => {
  const lowered = name.toLowerCase().replace(/\s|_/g, "");
  return formAliases[lowered] || lowered;
};

const normalizeSpecies = (name) => {
  const lowered = name.toLowerCase().replace(/\s|_/g, "");
  return speciesAliases[lowered] || lowered;
};

export const fetchPokemonByName = async (name) => {
  try {
    const normalizedName = normalizeName(name); 
    const normalizedSpecies = normalizeSpecies(name); 
    const res = await fetch(
      `${API_BASE_URL}/pokemon/${normalizedName}`
    );
    if (!res.ok) throw new Error("Pokémon not found");
    const data = await res.json();

    const speciesRes = await fetch(
      `${API_BASE_URL}/pokemon-species/${normalizedSpecies}`
    );
    if (!speciesRes.ok) throw new Error("Species data not found");
    const speciesData = await speciesRes.json();

    const englishEntry = Array.isArray(speciesData.flavor_text_entries)
      ? speciesData.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        )
      : null;

    const description = englishEntry
      ? englishEntry.flavor_text.replace(/\f/g, " ")
      : "No description available.";

    const isLegendary = speciesData.is_legendary;
    const isMythical = speciesData.is_mythical;

    return {
      name: data.name,
      imageNormal: data.sprites.other["official-artwork"].front_default,
      imageShiny: data.sprites.other["official-artwork"].front_shiny,
      types: data.types.map((typeObj) => typeObj.type.name),
      moves: data.moves
        .filter((entry) =>
          entry.version_group_details.some(
            (detail) => detail.move_learn_method.name === "level-up"
          )
        )
        .map((entry) => entry.move.name),
      abilities: data.abilities.map((abilityObj) => abilityObj.ability.name),
      description,
      isLegendary, 
      isMythical,
    };
  } catch (error) {
    console.error("Failed to fetch Pokémon:", error);
    throw error;
  }
};
export const fetchEvolutionChain = async (name) => {
  try {
    const normalizedSpecies = normalizeSpecies(name);

    const speciesRes = await fetch(
      `${API_BASE_URL}/pokemon-species/${normalizedSpecies}`
    );
    if (!speciesRes.ok) throw new Error("Species not found");

    const speciesData = await speciesRes.json();
    const evoUrl = speciesData.evolution_chain.url;

    const evoRes = await fetch(evoUrl);
    if (!evoRes.ok) throw new Error("Evolution chain not found");

    const evoData = await evoRes.json();
    const evoChain = [];

    const imageOverrides = {
      lycanroc: "lycanroc-midday",
     
    };

   
    const traverseChain = async (node, incomingCondition = "—") => {
      const speciesName = node.species.name;
      const resolvedName = imageOverrides[speciesName] || speciesName;

      const pokeRes = await fetch(
        `${API_BASE_URL}/pokemon/${resolvedName}`
      );
      if (!pokeRes.ok) throw new Error(`Could not fetch ${resolvedName}`);
      const pokeData = await pokeRes.json();
      const image = pokeData.sprites.other["official-artwork"].front_default;

      let condition = "Does not evolve";

     
      if (node.evolves_to.length > 0) {
        const child = node.evolves_to[0]; 
        const evoDetails = child.evolution_details?.[0];

        if (evoDetails) {
          const trigger = evoDetails.trigger?.name;
          const level = evoDetails.min_level;
          const item = evoDetails.item?.name;
          const time = evoDetails.time_of_day;

          if (trigger === "use-item" && item) {
            condition = `Evolves at: Use ${item.replace(/-/g, " ")}`;
          } else if (trigger === "level-up") {
            condition = level
              ? `Evolves at: Level ${level}`
              : time
              ? `Evolves during: ${time}`
              : "Evolves by: Level up";
          } else {
            condition = `Evolves by: ${trigger}`;
          }
        } else {
          condition = "Evolves by: unknown method";
        }
      }

      evoChain.push({ name: speciesName, image, condition });

   
      for (const next of node.evolves_to) {
        await traverseChain(next);
      }
    };

    await traverseChain(evoData.chain);
    return evoChain;
  } catch (error) {
    console.error("Failed to fetch evolution chain:", error);
    throw error;
  }
};

export const fetchPokemonWeaknesses = async (name) => {
  try {
    const normalizedName = normalizeName(name);

   
    const res = await fetch(
      `${API_BASE_URL}/pokemon/${normalizedName}`
    );
    if (!res.ok) throw new Error("Pokémon not found");
    const data = await res.json();

    const typeNames = data.types.map((typeObj) => typeObj.type.name);
    const damageRelations = {
      double_damage_from: [],
      half_damage_from: [],
      no_damage_from: [],
    };

  
    for (const typeName of typeNames) {
      const typeRes = await fetch(`${API_BASE_URL}/type/${typeName}`);
      if (!typeRes.ok) throw new Error(`Type ${typeName} not found`);
      const typeData = await typeRes.json();

      for (const key of Object.keys(damageRelations)) {
        typeData.damage_relations[key].forEach((relation) => {
          damageRelations[key].push(relation.name);
        });
      }
    }

 
    const countTypes = (arr) =>
      arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

    const doubleDamage = countTypes(damageRelations.double_damage_from);
    const halfDamage = new Set(damageRelations.half_damage_from);
    const noDamage = new Set(damageRelations.no_damage_from);

  
    const finalWeaknesses = Object.entries(doubleDamage)
      .filter(([type, count]) => !halfDamage.has(type) && !noDamage.has(type))
      .map(([type, count]) => ({
        type,
        multiplier: count === 2 ? "4x" : "2x",
      }));

    return finalWeaknesses;
  } catch (error) {
    console.error("Failed to fetch weaknesses:", error);
    throw error;
  }
};

export const fetchPokemonStrengths = async (name) => {
  try {
    const normalizedName = normalizeName(name);

 
    const res = await fetch(
      `${API_BASE_URL}/pokemon/${normalizedName}`
    );
    if (!res.ok) throw new Error("Pokémon not found");
    const data = await res.json();

    const typeNames = data.types.map((typeObj) => typeObj.type.name);
    const strengthsSet = new Set();

    
    for (const typeName of typeNames) {
      const typeRes = await fetch(`${API_BASE_URL}/type/${typeName}`);
      if (!typeRes.ok) throw new Error(`Type ${typeName} not found`);
      const typeData = await typeRes.json();

      typeData.damage_relations.double_damage_to.forEach((typeObj) =>
        strengthsSet.add(typeObj.name)
      );
    }

    return Array.from(strengthsSet);
  } catch (error) {
    console.error("Failed to fetch strengths:", error);
    throw error;
  }
};

export const getPokemonData = async (pokemonName) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/pokemon/${pokemonName.toLowerCase()}`
    );
    if (!res.ok) throw new Error("Pokémon not found");
    return await res.json();
  } catch (err) {
    console.error("Error fetching Pokémon data:", err);
    return null;
  }
};

export const getPokemonSpecies = async (name) => {
  try {
    const normalizedSpecies = normalizeSpecies(name);

    const res = await fetch(
      `${API_BASE_URL}/pokemon-species/${normalizedSpecies}`
    );
    if (!res.ok)
      throw new Error(`Species fetch failed for ${normalizedSpecies}`);

    const data = await res.json();

    if (!Array.isArray(data.genera)) {
      console.warn("Malformed species data:", data);
      return "Unknown species";
    }

    const englishGenus = data.genera.find((gen) => gen.language.name === "en");
    return englishGenus?.genus || "Unknown species";
  } catch (error) {
    console.error("Failed to fetch species:", error);
    return "Unknown species";
  }
};

export const fetchAllPokemonNames = () => {
  return fetch(`${API_BASE_URL}/pokemon?limit=1000`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch Pokémon list");
      }
      return res.json(); 
    })
    .then((data) => data.results.map((p) => p.name))
    .catch((error) => {
      console.error("Error fetching Pokémon names:", error); 
      throw error;
    });
};
