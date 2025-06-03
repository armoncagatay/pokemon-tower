// Get 3 unique random starters
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

    pokeCard.onclick = () => selectStarter(name, sprite);

    container.appendChild(pokeCard);
  }
};

const selectStarter = async (name, sprite) => {
  document.getElementById("starter-selection").style.display = "none";
  document.getElementById("game-start").style.display = "block";
  document.getElementById("chosen-name").textContent = name.toUpperCase();
  document.getElementById("chosen-sprite").src = sprite;

  const enemyName = earlyEnemies[Math.floor(Math.random() * earlyEnemies.length)];
  const enemyRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${enemyName}`);
  const enemyData = await enemyRes.json();
  const enemySprite = enemyData.sprites.front_default;

  // Create enemy display
  const gameStart = document.getElementById("game-start");
  const enemyDiv = document.createElement("div");
  enemyDiv.innerHTML = `
    <h2>Enemy Appears: ${enemyName.toUpperCase()}</h2>
    <img src="${enemySprite}" alt="${enemyName}">
  `;
  gameStart.appendChild(enemyDiv);

  // TODO: Add HP and Battle Buttons
};

showStarterChoices();
