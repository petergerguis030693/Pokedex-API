let pokemonList = [];
let currentIndex = 1;
let currentPokemonIndex = 0;

const typeToClassMap = {
  fire: "bg-red",
  grass: "bg-green",
  water: "bg-blue",
  electric: "bg-yellow",
  ice: "bg-lightblue",
  fighting: "bg-orange",
  poison: "bg-purple",
  ground: "bg-brown",
  flying: "bg-skyblue",
  psychic: "bg-pink",
  bug: "bg-limegreen",
  rock: "bg-gray",
  ghost: "bg-indigo",
  dragon: "bg-darkblue",
  dark: "bg-black",
  steel: "bg-silver",
  fairy: "bg-lightpink",
  normal: "bg-darkblue",
};

async function init() {
  await loadInitialPokemon();
  renderPokemon();
}

async function loadInitialPokemon() {
  const promises = [];
  for (let i = 1; i <= 40; i++) {
    promises.push(loadPokemon(i));
  }
  await Promise.all(promises);
}

async function loadPokemon(i) {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
    const response = await fetch(url);
    const pokemon = await response.json();
    pokemonList[i - 1] = pokemon;
  } catch (error) {
    console.error(`Failed to load Pokemon ${i}`, error);
  }
}

function renderPokemon() {
  const pokemonContainer = document.getElementById("pokemon-list");
  pokemonContainer.innerHTML = "";

  for (let i = 0; i < pokemonList.length; i++) {
    const pokemon = pokemonList[i];
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const className = ifRequest(types);
    const pokemonDiv = createPokemonDiv(i, pokemon, types, className);
    pokemonDiv.addEventListener("click", () => {
      currentPokemonIndex = i;
      detailPokemon(pokemon, i);
    });
    pokemonContainer.appendChild(pokemonDiv);
  }
}

function createPokemonDiv(index, pokemon, types, className) {
  const pokemonDiv = document.createElement("div");
  pokemonDiv.className = `pokemon ${className}`;
  pokemonDiv.innerHTML = createPokemonCardHtml(index, pokemon.name, pokemon.id, types);
  return pokemonDiv;
}

function createPokemonCardHtml(index, name, id, types) {
  const imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const typesHtml = types.map(type => `<span class="type-badge">${type}</span>`).join(' ');
  return `
    <div class="upperContainer">
      <p>#${index + 1}</p>
      <h3>${name}</h3>
    </div>
    <div class="upperC">
      <img src="${imgSrc}">
      <div class="categoryTypes" onclick="detailPokemon(pokemonList[${index}], ${index})">
        ${typesHtml}
      </div>
    </div>
  `;
}

async function loadMorePokemon() {
  const promises = [];
  for (let i = currentIndex; i < currentIndex + 10; i++) {
    promises.push(loadPokemon(i));
  }
  await Promise.all(promises);
  currentIndex += 10;
  renderPokemon();
}

async function more() {
  await loadMorePokemon();
  renderPokemon();
}

init();

function setupModalContent(pokemon, abilities, types, weight, height, moveHtml) {
  const modalContent = document.getElementById("pokemon-modal-content");
  modalContent.innerHTML = createModalContent(pokemon, abilities, types, weight, height, moveHtml);
}

function toggleBackButton(pokemon) {
  const backButton = document.getElementById('back');
  backButton.style.display = pokemon.name === 'bulbasaur' ? "none" : "inline-block";
}

function toggleDisplay(showModal) {
  const modal = document.getElementById("pokemon-modal");
  modal.style.display = showModal ? "flex" : "none";
  document.body.style.backgroundColor = showModal ? "lightgrey" : "white";
  document.getElementById("pokemon-list").style.display = showModal ? "none" : "";
  document.getElementById("moreButton").style.display = showModal ? "none" : "inline-block";
}

function processPokemonData(pokemon) {
  const abilities = extractNames(pokemon.abilities, "ability");
  const types = extractNames(pokemon.types, "type");
  const { weight, height } = pokemon;
  return { abilities, types, weight, height };
}

function detailPokemon(pokemon, index) {
  currentPokemonIndex = index;
  const { abilities, types, weight, height } = processPokemonData(pokemon);
  fetchMoveHtml(pokemon.moves).then((moveHtml) => {
    window.currentPokemonData = { abilities, types, weight, height, moveHtml };
    setupModalContent(pokemon, abilities, types, weight, height, moveHtml);
    toggleBackButton(pokemon);
    toggleDisplay(true);
  });
}

function extractNames(array, key) {
  return (array || [])
    .filter((info) => info && info[key])
    .map((info) => info[key].name)
    .join(", ");
}

function fetchMoveHtml(moves) {
  const movePromises = (moves || []).slice(0, 6).map(({ move }) =>
    fetch(move.url)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Failed to fetch move data for ${move.name}`);
        return response.json();
      })
      .then((data) => createMoveHtml(move.name, data.power || 0))
      .catch(() => `<p>${move.name}: Unable to fetch move data</p>`)
  );
  return Promise.all(movePromises);
}

function createMoveHtml(name, power) {
  return `<div>
    <p>${name}</p>
    <div class="progress" role="progressbar" aria-label="${name}" aria-valuenow="${power}" aria-valuemin="0" aria-valuemax="100">
      <div class="progress-bar" style="width: ${power}%">${power}</div>
     </div>
    </div>`;
}

function createModalContent(pokemon, abilities, types, weight, height, moveHtml) {
  return `${createHeader(pokemon.name)}
  ${createCard(pokemon.id, abilities, types, weight, height, moveHtml)}`;
}

function createHeader(name) {
  return `<button type="button" class="btn-close margin-left" aria-label="Close" onclick="closeModal()"></button><h5 class="card-title">${name}</h5>`;
}

function createCard(id, abilities, types, weight, height, moveHtml) {
  const imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  return `
  <div class="card" style="width: 18rem;">
    <div class="card-body">
      <img src="${imgSrc}" class="card-img-top">
        <button class="btn btn-primary" style="margin-right: 10px;" onclick="showTab('tab1')">About</button>
        <button class="btn btn-primary" onclick="showTab('tab2')">Base Stats</button>
      <div id="tabContent" style="width: 100%;">
        ${createTable(abilities, types, weight, height)}
      </div>
    </div>
    ${createButtons()}
  </div>`;
}

function showTab(tab) {
  const tabContent = document.getElementById('tabContent');
  if (!window.currentPokemonData) {
    console.error("currentPokemonData is not set");
    return;
  }
  const { abilities, types, weight, height, moveHtml } = window.currentPokemonData;
  if (tab === 'tab1') {
    tabContent.innerHTML = createTable(abilities, types, weight, height);
  } else if (tab === 'tab2') {
    tabContent.innerHTML = createMoves(moveHtml);
  }
}

function createTable(abilities, types, weight, height) {
  return `<table class="table table-borderless">${createTableRow(
    "Types",
    types
  )}
  ${createTableRow("Weight", weight)}
  ${createTableRow("Height", height)}
  ${createTableRow("Abilities", abilities)}
  </table>`;
}

function createTableRow(label, value) {
  return `
  <tr>
      <td>${label}</td>
      <td>${value}</td>
  </tr>`;
}

function createMoves(moveHtml) {
  return moveHtml.join("");
}

function createButtons() {
  return `<button class="btn btn-danger position-btn-right" onclick="next()">-></button>
  <button class="btn btn-danger position-btn-left" id="back" onclick="back()"><-</button>`;
}

function navigatePokemon(direction) {
  let newIndex = currentPokemonIndex + direction;
  if (newIndex >= 0 && newIndex < pokemonList.length) {
    currentPokemonIndex = newIndex;
    detailPokemon(pokemonList[newIndex], newIndex);
  }
}

function next() {
  navigatePokemon(1);
}

function back() {
  navigatePokemon(-1);
}

function closeModal() {
  const modal = document.getElementById("pokemon-modal");
  modal.style.display = "none";
  document.body.style.backgroundColor = "white";
  document.getElementById("pokemon-list").style.display = "";
  document.getElementById("moreButton").style.display = "";
}

function ifRequest(types) {
  if (types.includes("normal") && types.length > 1) {
    types = types.filter((type) => type !== "normal");
  } else if (types.length === 1 && types[0] === "normal") {
    types = ["normal"];
  }

  let primaryType = types[0];
  return typeToClassMap[primaryType] || "bg-darkblue";
}

function search() {
  const query = document.getElementById("search").value.toLowerCase();
  const filteredPokemon = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(query)
  );
  renderFilteredPokemon(filteredPokemon);
}

function renderFilteredPokemon(filteredPokemon) {
  const pokemonContainer = document.getElementById("pokemon-list");
  pokemonContainer.innerHTML = "";

  filteredPokemon.forEach((pokemon) => {
    const index = pokemonList.indexOf(pokemon);
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const className = ifRequest(types);

    const pokemonDiv = createPokemonDiv(index, pokemon, types, className);
    pokemonDiv.addEventListener("click", () => detailPokemon(pokemon, index));
    pokemonContainer.appendChild(pokemonDiv);
  });
}
