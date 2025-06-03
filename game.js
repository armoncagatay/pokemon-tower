const level = 5;
let starterPokemon = null;
let enemyPokemon = null;

// === Stat Utilities ===

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
  if (isHP) {
    return Math.floor(((2 * base + iv) * level) / 100) + level + 10;
  } else {
    return Math.floor(((2 * base + iv) * level) / 100) + 5;
  }
}

function createPokemonObject(apiData, name, level) {
  const ivs = generateIVs();
  const stats = {};

  apiData.stats.forEach(stat => {
    const statName = stat.stat.name;
    const base = stat.base_stat;
    stats[statName] = calculateStat(base, ivs[statName], level, statName === "hp");
  });

  return {
    name,
    level,
    sprite: apiData.sprites.front_default,
    ivs,
    stats,
    currentHP: stats.hp,
    maxHP: stats.hp
  };
}

// === Starter Selection ===

const getThreeStarters = () => {
  const pool = [...starterPool];
  const chosen = [];
  while (chosen.length < 3) {
    const index = Math.floor(Math.random() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }
  return chosen;
};

const showStarterChoices = async () => {
  const starterNames = getThreeStarters();
  const container = document.getElementById("starter-options");
  container.innerHTML = "";

  for (const name of starterNames) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = await res.json();
    const sprite = data.sprites.front_default;

    const pokeCard = document.createElement("div");
    pokeCard.style.display = "inline-block";
    pokeCard.style.margin = "10px";
    pokeCard.style.cursor = "pointer";
    pokeCard.innerHTML = `<img src="${sprite}" alt="${name}"><br><strong>${name.toUpperCase()}</strong>`;

    pokeCard.onclick = () => selectStarter(name, data);
    container.appendChild(pokeCard);
  }
};

// === Game Start ===

const selectStarter = async (name, data) => {
  document.getElementById("starter-selection").style.display = "none";
  document.getElementById("game-start").style.display = "block";

  // Create unique starter Pokémon
  starterPokemon = createPokemonObject(data, name, level);

  // Display player info
  document.getElementById("player-stats").innerHTML = `
    <strong>Level:</strong> ${starterPokemon.level}<br>
    <strong>IVs:</strong><br>
    HP: ${starterPokemon.ivs.hp} (Stat: ${starterPokemon.stats.hp})<br>
    ATK: ${starterPokemon.ivs.attack} (Stat: ${starterPokemon.stats.attack})<br>
    DEF: ${starterPokemon.ivs.defense} (Stat: ${starterPokemon.stats.defense})<br>
    SpA: ${starterPokemon.ivs["special-attack"]} (Stat: ${starterPokemon.stats["special-attack"]})<br>
    SpD: ${starterPokemon.ivs["special-defense"]} (Stat: ${starterPokemon.stats["special-defense"]})<br>
    SPD: ${starterPokemon.ivs.speed} (Stat: ${starterPokemon.stats.speed})
  `;
  document.getElementById("chosen-name").textContent = starterPokemon.name.toUpperCase();
  document.getElementById("chosen-sprite").src = starterPokemon.sprite;
  document.getElementById("player-hp-bar").style.width = "100%";
  document.getElementById("player-hp-text").textContent = `${starterPokemon.currentHP}/${starterPokemon.maxHP} HP`;

  // Generate enemy
  const enemyName = earlyEnemies[Math.floor(Math.random() * earlyEnemies.length)];
  const enemyRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${enemyName}`);
  const enemyData = await enemyRes.json();

  enemyPokemon = createPokemonObject(enemyData, enemyName, level);

  // Display enemy info
  document.getElementById("enemy-stats").innerHTML = `
    <strong>Level:</strong> ${enemyPokemon.level}<br>
    <strong>IVs:</strong><br>
    HP: ${enemyPokemon.ivs.hp} (Stat: ${enemyPokemon.stats.hp})<br>
    ATK: ${enemyPokemon.ivs.attack} (Stat: ${enemyPokemon.stats.attack})<br>
    DEF: ${enemyPokemon.ivs.defense} (Stat: ${enemyPokemon.stats.defense})<br>
    SpA: ${enemyPokemon.ivs["special-attack"]} (Stat: ${enemyPokemon.stats["special-attack"]})<br>
    SpD: ${enemyPokemon.ivs["special-defense"]} (Stat: ${enemyPokemon.stats["special-defense"]})<br>
    SPD: ${enemyPokemon.ivs.speed} (Stat: ${enemyPokemon.stats.speed})
  `;
  document.getElementById("enemy-name").textContent = enemyPokemon.name.toUpperCase();
  document.getElementById("enemy-sprite").src = enemyPokemon.sprite;
  document.getElementById("enemy-hp-bar").style.width = "100%";
  document.getElementById("enemy-hp-text").textContent = `${enemyPokemon.currentHP}/${enemyPokemon.maxHP} HP`;
};

// === Init ===

showStarterChoices();

function playerAttack() {
  const log = document.getElementById("battle-log");

  // Calculate player damage to enemy
  const playerAttack = starterPokemon.stats.attack;
  const enemyDefense = enemyPokemon.stats.defense;
  const damageToEnemy = Math.max(1, playerAttack - Math.floor(enemyDefense / 2));

  enemyPokemon.currentHP -= damageToEnemy;
  if (enemyPokemon.currentHP < 0) enemyPokemon.currentHP = 0;

  updateHPBar("enemy-hp-bar", "enemy-hp-text", enemyPokemon);

  log.innerText = `${starterPokemon.name.toUpperCase()} used Attack! It dealt ${damageToEnemy} damage.`;

  // Check if enemy fainted
  if (enemyPokemon.currentHP === 0) {
    log.innerText += `\n${enemyPokemon.name.toUpperCase()} fainted! You win! 🎉`;
    disableBattle();
    return;
  }

  // Wait, then let enemy counterattack
  setTimeout(enemyAttack, 1000);
}

function enemyAttack() {
  const log = document.getElementById("battle-log");

  const enemyAttack = enemyPokemon.stats.attack;
  const playerDefense = starterPokemon.stats.defense;
  const damageToPlayer = Math.max(1, enemyAttack - Math.floor(playerDefense / 2));

  starterPokemon.currentHP -= damageToPlayer;
  if (starterPokemon.currentHP < 0) starterPokemon.currentHP = 0;

  updateHPBar("player-hp-bar", "player-hp-text", starterPokemon);

  log.innerText += `\n${enemyPokemon.name.toUpperCase()} counterattacked and dealt ${damageToPlayer} damage!`;

  // Check if player fainted
  if (starterPokemon.currentHP === 0) {
    log.innerText += `\n${starterPokemon.name.toUpperCase()} fainted! You lose. 💀`;
    disableBattle();
  }
}

function updateHPBar(barId, textId, pokemon) {
  const percent = Math.floor((pokemon.currentHP / pokemon.maxHP) * 100);
  document.getElementById(barId).style.width = `${percent}%`;
  document.getElementById(textId).textContent = `${pokemon.currentHP}/${pokemon.maxHP} HP`;
}

function disableBattle() {
  document.querySelector("#battle-controls button").disabled = true;
}
