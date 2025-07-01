// Game Constants
const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Type effectiveness chart
const TYPE_CHART = {
  normal: { weakness: ['fighting'], resistance: [], immunity: ['ghost'] },
  fire: { weakness: ['water', 'ground', 'rock'], resistance: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immunity: [] },
  water: { weakness: ['electric', 'grass'], resistance: ['fire', 'water', 'ice', 'steel'], immunity: [] },
  grass: { weakness: ['fire', 'ice', 'poison', 'flying', 'bug'], resistance: ['water', 'electric', 'grass', 'ground'], immunity: [] },
  electric: { weakness: ['ground'], resistance: ['electric', 'flying', 'steel'], immunity: [] },
  ice: { weakness: ['fire', 'fighting', 'rock', 'steel'], resistance: ['ice'], immunity: [] },
  fighting: { weakness: ['flying', 'psychic', 'fairy'], resistance: ['bug', 'rock', 'dark'], immunity: [] },
  poison: { weakness: ['ground', 'psychic'], resistance: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immunity: [] },
  ground: { weakness: ['water', 'grass', 'ice'], resistance: ['poison', 'rock'], immunity: ['electric'] },
  flying: { weakness: ['electric', 'ice', 'rock'], resistance: ['grass', 'fighting', 'bug'], immunity: ['ground'] },
  psychic: { weakness: ['bug', 'ghost', 'dark'], resistance: ['fighting', 'psychic'], immunity: [] },
  bug: { weakness: ['fire', 'flying', 'rock'], resistance: ['grass', 'fighting', 'ground'], immunity: [] },
  rock: { weakness: ['water', 'grass', 'fighting', 'ground', 'steel'], resistance: ['normal', 'fire', 'poison', 'flying'], immunity: [] },
  ghost: { weakness: ['ghost', 'dark'], resistance: ['poison', 'bug'], immunity: ['normal', 'fighting'] },
  dragon: { weakness: ['ice', 'dragon', 'fairy'], resistance: ['fire', 'water', 'electric', 'grass'], immunity: [] },
  dark: { weakness: ['fighting', 'bug', 'fairy'], resistance: ['ghost', 'dark'], immunity: ['psychic'] },
  steel: { weakness: ['fire', 'fighting', 'ground'], resistance: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immunity: ['poison'] },
  fairy: { weakness: ['poison', 'steel'], resistance: ['fighting', 'bug', 'dark'], immunity: ['dragon'] }
};

// Starter Pool
const STARTER_POOL = [
  "bulbasaur", "charmander", "squirtle",
  "chikorita", "cyndaquil", "totodile",
  "treecko", "torchic", "mudkip",
  "turtwig", "chimchar", "piplup",
  "snivy", "tepig", "oshawott",
  "chespin", "fennekin", "froakie",
  "rowlet", "litten", "popplio",
  "grookey", "scorbunny", "sobble"
];

// Wild Pokémon Pools by Difficulty
const ENEMY_POOLS = {
  easy: [
    "rattata", "pidgey", "caterpie", "weedle", "sentret", "hoothoot",
    "zigzagoon", "wurmple", "starly", "bidoof", "patrat", "lillipup",
    "fletchling", "scatterbug", "yungoos", "wooloo", "skwovet"
  ],
  medium: [
    "nidoran-m", "nidoran-f", "vulpix", "oddish", "poliwag", "abra",
    "machop", "geodude", "ponyta", "slowpoke", "magnemite", "gastly",
    "houndour", "electrike", "buneary", "roggenrola", "tympole"
  ],
  hard: [
    "pikachu", "growlithe", "haunter", "scyther", "eevee", "dratini",
    "heracross", "larvitar", "beldum", "gible", "deino", "goomy",
    "mimikyu", "dreepy", "toxel"
  ],
  boss: [
    "charizard", "blastoise", "venusaur", "dragonite", "tyranitar",
    "salamence", "garchomp", "hydreigon", "goodra", "dragapult"
  ]
};

// Game State
const gameState = {
  playerPokemon: null,
  enemyPokemon: null,
  currentFloor: 1,
  battleActive: false,
  gameOver: false,
  battleLog: [],
  battleTurn: 0,
  battleInterval: null
};

// DOM Elements
const elements = {
  starterSelection: document.getElementById('starter-selection'),
  starterOptions: document.getElementById('starter-options'),
  battleScreen: document.getElementById('battle-screen'),
  towerProgress: document.getElementById('tower-progress'),
  gameOver: document.getElementById('game-over'),
  battleLog: document.getElementById('battle-log'),
  movesContainer: document.getElementById('moves-container'),
  playerName: document.getElementById('player-name'),
  playerLevel: document.getElementById('player-level'),
  playerLevelBattle: document.getElementById('player-level-battle'),
  playerSprite: document.getElementById('player-sprite'),
  playerHpBar: document.getElementById('player-hp-bar'),
  playerHpText: document.getElementById('player-hp-text'),
  playerStats: document.getElementById('player-stats'),
  enemyName: document.getElementById('enemy-name'),
  enemyLevel: document.getElementById('enemy-level'),
  enemySprite: document.getElementById('enemy-sprite'),
  enemyHpBar: document.getElementById('enemy-hp-bar'),
  enemyHpText: document.getElementById('enemy-hp-text'),
  enemyStats: document.getElementById('enemy-stats'),
  currentFloorEl: document.getElementById('current-floor'),
  playerPokemonName: document.getElementById('player-pokemon-name'),
  nextBattleBtn: document.getElementById('next-battle-btn'),
  restartBtn: document.getElementById('restart-btn'),
  gameResult: document.getElementById('game-result'),
  gameStats: document.getElementById('game-stats')
};

// Utility Functions
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateIVs() {
  return {
    hp: Math.floor(Math.random() * 32),
    attack: Math.floor(Math.random() * 32),
    defense: Math.floor(Math.random() * 32),
    "special-attack": Math.floor(Math.random() * 32),
    "special-defense": Math.floor(Math.random() * 32),
    speed: Math.floor(Math.random() * 32)
  };
}

function calculateStat(base, iv, level, isHP = false) {
  // Add a small random growth factor to make each Pokémon's stats unique
  const growthFactor = 1 + (Math.random() * 0.1); // 0-10% random growth bonus
  
  if (isHP) {
    // HP calculation with improved scaling for higher levels
    return Math.floor((((2 * base + iv) * level) / 100) * growthFactor) + level + 10;
  } else {
    // Other stats with improved scaling
    return Math.floor((((2 * base + iv) * level) / 100) * growthFactor) + 5;
  }
}

function getTypeEffectiveness(moveType, defenderTypes) {
  let effectiveness = 1;
  
  for (const defenderType of defenderTypes) {
    // Check immunity
    if (TYPE_CHART[defenderType]?.immunity?.includes(moveType)) {
      return 0;
    }
    
    // Check weakness
    if (TYPE_CHART[defenderType]?.weakness?.includes(moveType)) {
      effectiveness *= 2;
    }
    
    // Check resistance
    if (TYPE_CHART[defenderType]?.resistance?.includes(moveType)) {
      effectiveness *= 0.5;
    }
  }
  
  return effectiveness;
}

function calculateDamage(attacker, defender, move) {
  // Get move power (default to 40 if not specified)
  const power = move.power || 40;
  
  // Determine if move is physical or special
  const isPhysical = move.damage_class?.name === 'physical';
  
  // Get attacker's relevant attack stat
  const attackStat = isPhysical ? attacker.stats.attack : attacker.stats["special-attack"];
  
  // Get defender's relevant defense stat
  const defenseStat = isPhysical ? defender.stats.defense : defender.stats["special-defense"];
  
  // Check if move type matches attacker's type (STAB bonus)
  const stab = attacker.types.includes(move.type.name) ? 1.5 : 1;
  
  // Calculate type effectiveness
  const typeEffectiveness = getTypeEffectiveness(move.type.name, defender.types);
  
  // Calculate random factor (0.85 to 1.0)
  const random = 0.85 + (Math.random() * 0.15);
  
  // Calculate base damage
  let damage = Math.floor(((2 * attacker.level / 5 + 2) * power * attackStat / defenseStat) / 50 + 2);
  
  // Apply modifiers
  damage = Math.floor(damage * stab * typeEffectiveness * random);
  
  // Ensure minimum damage of 1 if type isn't immune
  return typeEffectiveness === 0 ? 0 : Math.max(1, damage);
}

// API Calls
async function fetchPokemon(name) {
  try {
    console.log(`Fetching Pokémon data for ${name} from ${API_BASE_URL}/pokemon/${name}`);
    const response = await fetch(`${API_BASE_URL}/pokemon/${name}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch ${name}: HTTP ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch ${name}: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched data for ${name}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Pokémon ${name}:`, error);
    return null;
  }
}

async function fetchPokemonSpecies(name) {
  try {
    console.log(`Fetching species data for ${name}`);
    const response = await fetch(`${API_BASE_URL}/pokemon-species/${name}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch species for ${name}: HTTP ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch species for ${name}: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched species data for ${name}`);
    return data;
  } catch (error) {
    console.error(`Error fetching species for ${name}:`, error);
    return null;
  }
}

async function fetchMove(url) {
  try {
    console.log(`Fetching move data from ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch move: HTTP ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch move: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched move data for ${data.name}`);
    return data;
  } catch (error) {
    console.error('Error fetching move:', error);
    return null;
  }
}

// Pokémon Creation
async function createPokemon(name, level, isEnemy = false) {
  console.log(`Creating ${name} at level ${level} (isEnemy: ${isEnemy})`);
  
  // Fetch basic Pokémon data
  console.log(`Fetching data for ${name} from PokéAPI...`);
  const pokemonData = await fetchPokemon(name);
  
  if (!pokemonData) {
    console.error(`Failed to fetch data for ${name}`);
    return null;
  }
  
  console.log(`Successfully fetched basic data for ${name}`);
  
  // Generate IVs
  const ivs = generateIVs();
  console.log(`Generated IVs for ${name}:`, ivs);
  
  // Calculate stats
  const stats = {};
  console.log(`Calculating stats for ${name}...`);
  pokemonData.stats.forEach(stat => {
    const statName = stat.stat.name;
    const base = stat.base_stat;
    stats[statName] = calculateStat(base, ivs[statName], level, statName === "hp");
    console.log(`Calculated ${statName}: ${stats[statName]} (base: ${base}, iv: ${ivs[statName]})`);
  });
  
  // Get types
  const types = pokemonData.types.map(typeInfo => typeInfo.type.name);
  console.log(`${name}'s types:`, types);
  
  // Get moves
  const movesData = [];
  
  // For player Pokémon, get 4 random moves. For enemy, get 2-4 moves.
  const moveCount = isEnemy ? getRandomInt(2, 4) : 4;
  console.log(`Attempting to get ${moveCount} moves for ${name}...`);
  
  try {
    // Filter moves to only get those that can be learned by level up
    const learnableMoves = pokemonData.moves.filter(move => 
      move.version_group_details.some(detail => 
        detail.move_learn_method.name === "level-up" && 
        detail.level_learned_at <= level
      )
    );
    
    console.log(`Found ${learnableMoves.length} learnable moves for ${name} at level ${level}`);
    
    // If there are enough learnable moves, select randomly
    if (learnableMoves.length > 0) {
      const shuffledMoves = [...learnableMoves].sort(() => 0.5 - Math.random());
      
      // Try to fetch moves with power
      const movsWithPowerPromises = [];
      for (let i = 0; i < Math.min(moveCount * 2, shuffledMoves.length); i++) {
        movsWithPowerPromises.push(fetchMove(shuffledMoves[i].move.url));
      }
      
      const fetchedMoves = await Promise.all(movsWithPowerPromises);
      const movesWithPower = fetchedMoves.filter(move => move && move.power);
      
      console.log(`Found ${movesWithPower.length} moves with power values`);
      
      // Add moves with power to the movesData array (up to moveCount)
      for (let i = 0; i < Math.min(moveCount, movesWithPower.length); i++) {
        movesData.push(movesWithPower[i]);
        console.log(`Added move: ${movesWithPower[i].name}`);
      }
    }
  } catch (error) {
    console.error('Error fetching learnable moves:', error);
  }
  
  // If we couldn't get enough attack moves, add some default ones
  if (movesData.length < moveCount) {
    console.log(`Not enough moves with power (${movesData.length}/${moveCount}), adding default moves...`);
    await addDefaultMoves(movesData, moveCount, types);
  }
  
  console.log(`Final move list for ${name}:`, movesData.map(m => m.name));
  
  if (movesData.length === 0) {
    console.error(`Failed to add any moves for ${name}. Adding fallback moves.`);
    movesData.push({
      name: "tackle",
      type: { name: "normal" },
      power: 40,
      accuracy: 100,
      damage_class: { name: "physical" }
    });
  }
  
  // Create the Pokémon object
  const pokemon = {
    name,
    displayName: capitalizeFirstLetter(name),
    level,
    types,
    sprite: pokemonData.sprites.front_default,
    backSprite: pokemonData.sprites.back_default || pokemonData.sprites.front_default,
    ivs,
    stats,
    currentHP: stats.hp,
    maxHP: stats.hp,
    moves: movesData,
    exp: 0,
    nextLevelExp: level * 50,
    victories: 0
  };
  
  console.log(`Successfully created ${name} Pokémon object`);
  return pokemon;
}

// Helper function to add default moves
async function addDefaultMoves(movesData, targetCount, types) {
  console.log(`Need to add ${targetCount - movesData.length} more moves`);
  
  // Default moves based on type
  const defaultMoves = {
    normal: ["tackle", "quick-attack", "scratch", "pound"],
    fire: ["ember", "fire-spin", "flame-charge", "flamethrower"],
    water: ["water-gun", "bubble", "water-pulse", "aqua-jet"],
    grass: ["vine-whip", "razor-leaf", "bullet-seed", "magical-leaf"],
    electric: ["thunder-shock", "spark", "thunderbolt", "electro-ball"],
    ice: ["ice-shard", "icy-wind", "powder-snow", "aurora-beam"],
    fighting: ["karate-chop", "low-kick", "rock-smash", "force-palm"],
    poison: ["poison-sting", "acid", "sludge", "venoshock"],
    ground: ["mud-slap", "bulldoze", "mud-shot", "sand-attack"],
    flying: ["gust", "wing-attack", "peck", "aerial-ace"],
    psychic: ["confusion", "psybeam", "psywave", "psyshock"],
    bug: ["bug-bite", "struggle-bug", "fury-cutter", "silver-wind"],
    rock: ["rock-throw", "rock-tomb", "rollout", "smack-down"],
    ghost: ["astonish", "lick", "shadow-sneak", "night-shade"],
    dragon: ["dragon-rage", "twister", "dragon-breath", "dragon-claw"],
    dark: ["bite", "thief", "assurance", "pursuit"],
    steel: ["metal-claw", "iron-head", "mirror-shot", "flash-cannon"],
    fairy: ["fairy-wind", "draining-kiss", "disarming-voice", "dazzling-gleam"]
  };
  
  // Generic moves any Pokémon can learn
  const genericMoves = ["tackle", "quick-attack", "hidden-power", "facade", "round", "echoed-voice", "swift"];
  
  // Create a list of moves to try
  let movesToTry = [];
  
  // Add type-specific moves
  if (types && types.length > 0) {
    for (const type of types) {
      if (defaultMoves[type]) {
        movesToTry = [...movesToTry, ...defaultMoves[type]];
      }
    }
  }
  
  // Add generic moves
  movesToTry = [...movesToTry, ...genericMoves];
  
  // Remove duplicates
  movesToTry = [...new Set(movesToTry)];
  
  console.log(`Will try these moves: ${movesToTry.join(', ')}`);
  
  // Keep track of moves we've already tried to avoid infinite loops
  const triedMoves = new Set();
  
  // Try adding moves until we have enough or run out of options
  while (movesData.length < targetCount && movesToTry.length > 0 && triedMoves.size < movesToTry.length) {
    // Get next move to try
    const moveToTry = movesToTry.find(move => !triedMoves.has(move));
    
    if (!moveToTry) {
      console.log("No more moves to try");
      break;
    }
    
    console.log(`Trying to add move: ${moveToTry}`);
    triedMoves.add(moveToTry);
    
    try {
      const moveData = await fetchMove(`${API_BASE_URL}/move/${moveToTry}`);
      
      if (moveData && moveData.power) {
        // Check if this move is already in the list
        if (!movesData.some(m => m.name === moveData.name)) {
          console.log(`Added move: ${moveData.name}`);
          movesData.push(moveData);
        } else {
          console.log(`Move ${moveData.name} already exists in the list`);
        }
      } else {
        console.log(`Move ${moveToTry} has no power value, skipping`);
      }
    } catch (error) {
      console.error(`Error adding move ${moveToTry}:`, error);
    }
  }
  
  // If we still don't have enough moves, add a fallback "struggle" move
  if (movesData.length < targetCount) {
    console.log("Not enough moves found, adding fallback move");
    
    // Create a simple fallback move
    const fallbackMove = {
      name: "struggle",
      type: { name: "normal" },
      power: 50,
      accuracy: 100,
      damage_class: { name: "physical" }
    };
    
    // Add fallback move to reach the target count
    while (movesData.length < targetCount) {
      movesData.push(fallbackMove);
      console.log("Added fallback move: struggle");
    }
  }
  
  console.log(`Final moves count: ${movesData.length}`);
}

// Game Initialization
async function initGame() {
  // Show starter selection
  showStarterChoices();
  
  // Add event listeners
  elements.nextBattleBtn.addEventListener('click', startNextBattle);
  elements.restartBtn.addEventListener('click', restartGame);
}

async function showStarterChoices() {
  console.log("Loading starter choices...");
  elements.starterOptions.innerHTML = '';
  
  // Get 3 random starter Pokémon
  const starters = getRandomStarters(3);
  console.log("Selected starters:", starters);
  
  // Create a card for each starter
  for (const starterName of starters) {
    try {
      // Fetch Pokémon data
      const pokemonData = await fetchPokemon(starterName);
      const speciesData = await fetchPokemonSpecies(starterName);
      
      if (!pokemonData) {
        console.error(`Failed to fetch data for ${starterName}`);
        continue;
      }
      
      // Create card element
      const card = document.createElement('div');
      card.className = 'pokemon-card';
      
      // Get types for display
      const types = pokemonData.types.map(typeInfo => {
        return `<span class="type type-${typeInfo.type.name}">${capitalizeFirstLetter(typeInfo.type.name)}</span>`;
      }).join(' ');
      
      // Get flavor text if available
      let flavorText = '';
      if (speciesData && speciesData.flavor_text_entries) {
        const englishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (englishEntry) {
          flavorText = englishEntry.flavor_text.replace(/\f/g, ' ');
        }
      }
      
      // Populate card with Pokémon info
      card.innerHTML = `
        <img src="${pokemonData.sprites.front_default}" alt="${starterName}">
        <div class="name">${capitalizeFirstLetter(starterName)}</div>
        <div class="types">${types}</div>
        <div class="flavor-text">${flavorText}</div>
      `;
      
      // Add click event to select this starter
      card.onclick = function() {
        console.log(`Selected ${starterName}`);
        selectStarter(starterName);
      };
      
      // Add to options container
      elements.starterOptions.appendChild(card);
      console.log(`Added card for ${starterName}`);
    } catch (error) {
      console.error(`Error creating card for ${starterName}:`, error);
    }
  }
}

function getRandomStarters(count) {
  const pool = [...STARTER_POOL];
  const chosen = [];
  
  while (chosen.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }
  
  return chosen;
}

async function selectStarter(name) {
  console.log(`Starting the process to select ${name}`);
  
  // Create player Pokémon
  const startingLevel = 5;
  console.log(`Creating Pokémon ${name} at level ${startingLevel}`);
  gameState.playerPokemon = await createPokemon(name, startingLevel);
  
  if (!gameState.playerPokemon) {
    console.error(`Failed to create Pokémon ${name}`);
    addToLog('Error creating Pokémon! Please try again.', 'log-system');
    return;
  }
  
  console.log("Player Pokémon created successfully:", gameState.playerPokemon);
  
  // Update UI
  elements.playerPokemonName.textContent = gameState.playerPokemon.displayName;
  elements.playerLevel.textContent = gameState.playerPokemon.level;
  
  console.log("Updating game view to tower progress screen");
  // Hide starter selection, show tower progress
  elements.starterSelection.classList.add('hidden');
  elements.towerProgress.classList.remove('hidden');
  
  // Update floor display
  elements.currentFloorEl.textContent = gameState.currentFloor;
  console.log(`Game initialized with ${name} at floor ${gameState.currentFloor}`);
}

// Battle System
async function startNextBattle() {
  // Hide tower progress, show battle screen
  elements.towerProgress.classList.add('hidden');
  elements.battleScreen.classList.remove('hidden');
  
  // Set battle active
  gameState.battleActive = true;
  gameState.battleTurn = 0;
  
  // Clear battle log
  elements.battleLog.innerHTML = '';
  gameState.battleLog = [];
  
  // Clear moves container
  elements.movesContainer.innerHTML = '';
  
  // Generate enemy based on current floor
  await generateEnemy();
  
  // Update battle UI
  updateBattleUI();
  
  // Add first log entry
  addToLog(`A wild ${gameState.enemyPokemon.displayName} appeared!`, 'log-system');
  addToLog(`Go, ${gameState.playerPokemon.displayName}!`, 'log-player');
  
  // Determine turn order based on speed
  if (gameState.playerPokemon.stats.speed >= gameState.enemyPokemon.stats.speed) {
    addToLog(`Your ${gameState.playerPokemon.displayName} will move first!`, 'log-system');
    // Enable player's move buttons
    createMoveButtons();
  } else {
    addToLog(`The wild ${gameState.enemyPokemon.displayName} will move first!`, 'log-system');
    // Enemy goes first
    setTimeout(enemyTurn, 1500);
  }
}

async function generateEnemy() {
  // Determine enemy level based on floor (slightly random)
  const baseLevel = Math.max(5, Math.floor(gameState.currentFloor * 1.5));
  const enemyLevel = baseLevel + getRandomInt(-1, 1);
  
  // Determine enemy pool based on floor
  let pool;
  if (gameState.currentFloor % 10 === 0) {
    // Boss every 10 floors
    pool = ENEMY_POOLS.boss;
  } else if (gameState.currentFloor % 5 === 0) {
    // Hard enemy every 5 floors
    pool = ENEMY_POOLS.hard;
  } else if (gameState.currentFloor > 5) {
    // Medium enemy after floor 5
    pool = ENEMY_POOLS.medium;
  } else {
    // Easy enemy for first 5 floors
    pool = ENEMY_POOLS.easy;
  }
  
  // Select random enemy from pool
  const enemyName = getRandomFromArray(pool);
  
  // Create enemy Pokémon
  gameState.enemyPokemon = await createPokemon(enemyName, enemyLevel, true);
  
  if (!gameState.enemyPokemon) {
    addToLog('Error creating enemy! Generating a fallback...', 'log-system');
    // Fallback to a common Pokémon
    gameState.enemyPokemon = await createPokemon('pidgey', enemyLevel, true);
  }
}

function updateBattleUI() {
  // Update player info
  elements.playerName.textContent = gameState.playerPokemon.displayName;
  elements.playerLevelBattle.textContent = gameState.playerPokemon.level;
  elements.playerSprite.src = gameState.playerPokemon.backSprite || gameState.playerPokemon.sprite;
  
  // Update player HP
  const playerHpPercent = (gameState.playerPokemon.currentHP / gameState.playerPokemon.maxHP) * 100;
  elements.playerHpBar.style.width = `${playerHpPercent}%`;
  elements.playerHpText.textContent = `${gameState.playerPokemon.currentHP}/${gameState.playerPokemon.maxHP} HP`;
  
  // Update player HP bar color
  if (playerHpPercent <= 20) {
    elements.playerHpBar.style.backgroundColor = 'var(--hp-red)';
  } else if (playerHpPercent <= 50) {
    elements.playerHpBar.style.backgroundColor = 'var(--hp-yellow)';
  } else {
    elements.playerHpBar.style.backgroundColor = 'var(--hp-green)';
  }
  
  // Update player stats display
  elements.playerStats.innerHTML = `
    <strong>Stats:</strong><br>
    HP: ${gameState.playerPokemon.stats.hp}<br>
    Attack: ${gameState.playerPokemon.stats.attack}<br>
    Defense: ${gameState.playerPokemon.stats.defense}<br>
    Sp. Atk: ${gameState.playerPokemon.stats["special-attack"]}<br>
    Sp. Def: ${gameState.playerPokemon.stats["special-defense"]}<br>
    Speed: ${gameState.playerPokemon.stats.speed}
  `;
  
  // Update enemy info
  elements.enemyName.textContent = gameState.enemyPokemon.displayName;
  elements.enemyLevel.textContent = gameState.enemyPokemon.level;
  elements.enemySprite.src = gameState.enemyPokemon.sprite;
  
  // Update enemy HP
  const enemyHpPercent = (gameState.enemyPokemon.currentHP / gameState.enemyPokemon.maxHP) * 100;
  elements.enemyHpBar.style.width = `${enemyHpPercent}%`;
  elements.enemyHpText.textContent = `${gameState.enemyPokemon.currentHP}/${gameState.enemyPokemon.maxHP} HP`;
  
  // Update enemy HP bar color
  if (enemyHpPercent <= 20) {
    elements.enemyHpBar.style.backgroundColor = 'var(--hp-red)';
  } else if (enemyHpPercent <= 50) {
    elements.enemyHpBar.style.backgroundColor = 'var(--hp-yellow)';
  } else {
    elements.enemyHpBar.style.backgroundColor = 'var(--hp-green)';
  }
  
  // Update enemy stats display
  elements.enemyStats.innerHTML = `
    <strong>Stats:</strong><br>
    HP: ${gameState.enemyPokemon.stats.hp}<br>
    Attack: ${gameState.enemyPokemon.stats.attack}<br>
    Defense: ${gameState.enemyPokemon.stats.defense}<br>
    Sp. Atk: ${gameState.enemyPokemon.stats["special-attack"]}<br>
    Sp. Def: ${gameState.enemyPokemon.stats["special-defense"]}<br>
    Speed: ${gameState.enemyPokemon.stats.speed}
  `;
}

function createMoveButtons() {
  // Clear existing buttons
  elements.movesContainer.innerHTML = '';
  
  // Create a button for each move
  gameState.playerPokemon.moves.forEach(move => {
    const button = document.createElement('button');
    button.className = 'move-button';
    button.classList.add(`type-${move.type.name}`);
    button.textContent = capitalizeFirstLetter(move.name.replace('-', ' '));
    
    // Add move info as tooltip
    button.title = `Type: ${capitalizeFirstLetter(move.type.name)}
Power: ${move.power || 'N/A'}
Accuracy: ${move.accuracy || 'N/A'}`;
    
    // Add click event
    button.addEventListener('click', () => usePlayerMove(move));
    
    // Add to container
    elements.movesContainer.appendChild(button);
  });
}

function disableMoveButtons() {
  const buttons = elements.movesContainer.querySelectorAll('.move-button');
  buttons.forEach(button => {
    button.disabled = true;
  });
}

function enableMoveButtons() {
  const buttons = elements.movesContainer.querySelectorAll('.move-button');
  buttons.forEach(button => {
    button.disabled = false;
  });
}

function addToLog(message, cssClass = '') {
  // Add to state
  gameState.battleLog.push({ message, cssClass });
  
  // Create log entry
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${cssClass}`;
  logEntry.textContent = message;
  
  // Add to DOM
  elements.battleLog.appendChild(logEntry);
  
  // Scroll to bottom
  elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
}

async function usePlayerMove(move) {
  // Disable move buttons during animation
  disableMoveButtons();
  
  // Increment turn counter
  gameState.battleTurn++;
  
  // Get type effectiveness
  const effectiveness = getTypeEffectiveness(move.type.name, gameState.enemyPokemon.types);
  
  // Calculate damage
  const damage = calculateDamage(gameState.playerPokemon, gameState.enemyPokemon, move);
  
  // Animate attack
  elements.playerSprite.classList.add('attack');
  await new Promise(resolve => setTimeout(resolve, 300));
  elements.playerSprite.classList.remove('attack');
  
  // Log the move
  addToLog(`${gameState.playerPokemon.displayName} used ${capitalizeFirstLetter(move.name.replace('-', ' '))}!`, 'log-player');
  
  // Handle effectiveness
  if (effectiveness === 0) {
    addToLog("It had no effect...", 'log-system');
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else if (effectiveness > 1) {
    elements.enemySprite.classList.add('hit');
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.enemySprite.classList.remove('hit');
    addToLog("It's super effective!", 'log-critical');
  } else if (effectiveness < 1) {
    elements.enemySprite.classList.add('hit');
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.enemySprite.classList.remove('hit');
    addToLog("It's not very effective...", 'log-system');
  } else {
    elements.enemySprite.classList.add('hit');
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.enemySprite.classList.remove('hit');
  }
  
  // Apply damage
  if (damage > 0) {
    gameState.enemyPokemon.currentHP = Math.max(0, gameState.enemyPokemon.currentHP - damage);
    addToLog(`It dealt ${damage} damage!`, 'log-player');
  }
  
  // Update UI
  updateBattleUI();
  
  // Check if enemy fainted
  if (gameState.enemyPokemon.currentHP === 0) {
    await handleEnemyFainted();
    return;
  }
  
  // Enemy's turn
  await new Promise(resolve => setTimeout(resolve, 1000));
  await enemyTurn();
}

async function enemyTurn() {
  // Check if battle is still active
  if (!gameState.battleActive) return;
  
  // Select a random move
  const move = getRandomFromArray(gameState.enemyPokemon.moves);
  
  // Get type effectiveness
  const effectiveness = getTypeEffectiveness(move.type.name, gameState.playerPokemon.types);
  
  // Calculate damage
  const damage = calculateDamage(gameState.enemyPokemon, gameState.playerPokemon, move);
  
  // Animate attack
  elements.enemySprite.classList.add('attack');
  await new Promise(resolve => setTimeout(resolve, 300));
  elements.enemySprite.classList.remove('attack');
  
  // Log the move
  addToLog(`Wild ${gameState.enemyPokemon.displayName} used ${capitalizeFirstLetter(move.name.replace('-', ' '))}!`, 'log-enemy');
  
  // Handle effectiveness
  if (effectiveness === 0) {
    addToLog("It had no effect...", 'log-system');
  } else if (effectiveness > 1) {
    elements.playerSprite.classList.add('hit');
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.playerSprite.classList.remove('hit');
    addToLog("It's super effective!", 'log-critical');
  } else if (effectiveness < 1) {
    elements.playerSprite.classList.add('hit');
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.playerSprite.classList.remove('hit');
    addToLog("It's not very effective...", 'log-system');
  } else {
    elements.playerSprite.classList.add('hit');
    await new Promise(resolve => setTimeout(resolve, 300));
    elements.playerSprite.classList.remove('hit');
  }
  
  // Apply damage
  if (damage > 0) {
    gameState.playerPokemon.currentHP = Math.max(0, gameState.playerPokemon.currentHP - damage);
    addToLog(`It dealt ${damage} damage!`, 'log-enemy');
  }
  
  // Update UI
  updateBattleUI();
  
  // Check if player fainted
  if (gameState.playerPokemon.currentHP === 0) {
    await handlePlayerFainted();
    return;
  }
  
  // Enable player's move buttons for their turn
  await new Promise(resolve => setTimeout(resolve, 1000));
  enableMoveButtons();
}

async function handleEnemyFainted() {
  // Log enemy fainted
  addToLog(`Wild ${gameState.enemyPokemon.displayName} fainted!`, 'log-system');
  
  // Calculate experience based on enemy level and floor
  // Higher level enemies and higher floors give more experience
  const baseExpGain = gameState.enemyPokemon.level * 10;
  const floorBonus = Math.floor(gameState.currentFloor * 1.5);
  const totalExpGain = baseExpGain + floorBonus;
  
  gameState.playerPokemon.exp += totalExpGain;
  addToLog(`${gameState.playerPokemon.displayName} gained ${totalExpGain} EXP!`, 'log-player');
  
  console.log(`Current EXP: ${gameState.playerPokemon.exp}/${gameState.playerPokemon.nextLevelExp}`);
  
  // Check for level up
  while (gameState.playerPokemon.exp >= gameState.playerPokemon.nextLevelExp) {
    await levelUp();
  }
  
  // Increment victories
  gameState.playerPokemon.victories++;
  
  // End battle
  gameState.battleActive = false;
  
  // Wait a moment then return to tower screen
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Advance to next floor
  gameState.currentFloor++;
  elements.currentFloorEl.textContent = gameState.currentFloor;
  
  // Update player info on tower screen
  elements.playerPokemonName.textContent = gameState.playerPokemon.displayName;
  elements.playerLevel.textContent = gameState.playerPokemon.level;
  
  // Hide battle screen, show tower progress
  elements.battleScreen.classList.add('hidden');
  elements.towerProgress.classList.remove('hidden');
  
  // Heal player Pokémon a bit (30% of missing HP)
  const missingHp = gameState.playerPokemon.maxHP - gameState.playerPokemon.currentHP;
  const healAmount = Math.floor(missingHp * 0.3);
  gameState.playerPokemon.currentHP = Math.min(gameState.playerPokemon.maxHP, gameState.playerPokemon.currentHP + healAmount);
  
  console.log(`Healed ${healAmount} HP. Current HP: ${gameState.playerPokemon.currentHP}/${gameState.playerPokemon.maxHP}`);
}

async function handlePlayerFainted() {
  // Log player fainted
  addToLog(`${gameState.playerPokemon.displayName} fainted!`, 'log-system');
  
  // End battle
  gameState.battleActive = false;
  gameState.gameOver = true;
  
  // Wait a moment then show game over screen
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Show game over screen
  elements.battleScreen.classList.add('hidden');
  elements.gameOver.classList.remove('hidden');
  
  // Update game over screen
  elements.gameResult.textContent = "Game Over";
  elements.gameStats.innerHTML = `
    <p>Your ${gameState.playerPokemon.displayName} reached level ${gameState.playerPokemon.level}</p>
    <p>You climbed to floor ${gameState.currentFloor}</p>
    <p>Victories: ${gameState.playerPokemon.victories}</p>
  `;
}

async function levelUp() {
  // Increase level
  const oldLevel = gameState.playerPokemon.level;
  gameState.playerPokemon.level++;
  
  console.log(`Leveling up from ${oldLevel} to ${gameState.playerPokemon.level}`);
  
  // Reset exp and increase next level threshold (make it progressively harder to level up)
  gameState.playerPokemon.exp = 0;
  gameState.playerPokemon.nextLevelExp = Math.floor(gameState.playerPokemon.level * 50 * (1 + gameState.playerPokemon.level * 0.1));
  
  console.log(`Next level requires ${gameState.playerPokemon.nextLevelExp} EXP`);
  
  // Store old stats for comparison
  const oldStats = { ...gameState.playerPokemon.stats };
  
  // Recalculate stats for new level with improved formula
  Object.keys(gameState.playerPokemon.stats).forEach(statName => {
    const isHP = statName === 'hp';
    
    // Extract the base stat value from the current stat
    const baseStatValue = oldStats[statName] - (isHP ? oldLevel + 10 : 5);
    const baseValue = Math.floor(baseStatValue * 100 / (2 * oldLevel));
    
    // Calculate new stat with the new level
    gameState.playerPokemon.stats[statName] = calculateStat(
      baseValue, 
      gameState.playerPokemon.ivs[statName], 
      gameState.playerPokemon.level, 
      isHP
    );
    
    console.log(`${statName}: ${oldStats[statName]} -> ${gameState.playerPokemon.stats[statName]}`);
  });
  
  // Heal to full HP
  gameState.playerPokemon.currentHP = gameState.playerPokemon.maxHP = gameState.playerPokemon.stats.hp;
  
  // Add level up animation/effect (changing background color of battle log)
  const battleLog = document.getElementById('battle-log');
  battleLog.style.backgroundColor = '#4CAF50';
  await new Promise(resolve => setTimeout(resolve, 300));
  battleLog.style.backgroundColor = '#333';
  
  // Log level up with styling
  addToLog(`🎉 ${gameState.playerPokemon.displayName} grew to level ${gameState.playerPokemon.level}! 🎉`, 'log-critical');
  
  // Show stat increases with better formatting
  Object.keys(oldStats).forEach(statName => {
    const increase = gameState.playerPokemon.stats[statName] - oldStats[statName];
    
    // Only show stats that actually increased
    if (increase > 0) {
      const statDisplayName = statName === 'hp' ? 'HP' : 
        statName === 'attack' ? 'Attack' : 
        statName === 'defense' ? 'Defense' : 
        statName === 'special-attack' ? 'Sp. Atk' : 
        statName === 'special-defense' ? 'Sp. Def' : 'Speed';
        
      addToLog(`${statDisplayName} increased by +${increase}! (${oldStats[statName]} → ${gameState.playerPokemon.stats[statName]})`, 'log-player');
    }
  });
  
  // Update UI to reflect new level and stats
  if (elements.battleScreen.classList.contains('hidden')) {
    // If we're not in battle, update the tower progress screen
    elements.playerLevel.textContent = gameState.playerPokemon.level;
  } else {
    // If we're in battle, update the battle screen
    elements.playerLevelBattle.textContent = gameState.playerPokemon.level;
    updateBattleUI();
  }
  
  // Check for new moves (you could implement this later)
  // For now, we'll just add a message that new moves could be learned at certain levels
  if (gameState.playerPokemon.level % 5 === 0) {
    addToLog(`At level ${gameState.playerPokemon.level}, new moves could be learned!`, 'log-system');
    // This is where you could implement move learning in the future
  }
}

function restartGame() {
  // Reset game state
  gameState.playerPokemon = null;
  gameState.enemyPokemon = null;
  gameState.currentFloor = 1;
  gameState.battleActive = false;
  gameState.gameOver = false;
  gameState.battleLog = [];
  gameState.battleTurn = 0;
  
  // Hide all screens except starter selection
  elements.towerProgress.classList.add('hidden');
  elements.battleScreen.classList.add('hidden');
  elements.gameOver.classList.add('hidden');
  elements.starterSelection.classList.remove('hidden');
  
  // Show starter choices
  showStarterChoices();
}

// Initialize the game
initGame();