// Fetch a random Pokémon
const getRandomPokemon = async () => {
  const id = Math.floor(Math.random() * 151) + 1; // Gen 1 Pokémon only
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();

  const name = data.name;
  const sprite = data.sprites.front_default;

  const infoDiv = document.getElementById('pokemon-info');
  infoDiv.innerHTML = `<h2>${name.toUpperCase()}</h2><img src="${sprite}" alt="${name}">`;
};

getRandomPokemon();