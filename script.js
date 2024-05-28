let pokemonList = [];
let currentIndex = 41;
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
}


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
    pokemonList[i - 1] = pokemon; // Speichern Sie das Pokemon an der richtigen Position
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
    const typesString = types.join(", ");
    const backgroundColor = ifRequest(types);

    const pokemonDiv = createPokemonDiv(i,pokemon,typesString,backgroundColor);
    pokemonDiv.addEventListener("click", () => {
      currentPokemonIndex = i;
      detailPokemon(pokemon);
    });

    pokemonContainer.appendChild(pokemonDiv);
  }
}

function createPokemonDiv(index, pokemon, typesString, className) {
  const pokemonDiv = document.createElement("div");
  pokemonDiv.className = `pokemon ${className}`;
  pokemonDiv.innerHTML = createPokemonCardHtml(index, pokemon.name, pokemon.sprites.front_default, typesString);
  return pokemonDiv;
}


function createPokemonCardHtml(index, name, imgSrc, typesString) {
  return `
    <div class="upperContainer">
      <p>#${index + 1}</p>
      <h3>${name}</h3>
    </div>
    <div class="upperC">
      <img src="${imgSrc}">
      <div class="categoryTypes" onclick="detailPokemon(${index}, '${name}', '${typesString}')">
        <p>${typesString}</p>
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
}

async function more() {
  await loadMorePokemon();
  renderPokemon();
}

init();

function detailPokemon(pokemon) {
  const modal = document.getElementById("pokemon-modal");
  const modalContent = document.getElementById("pokemon-modal-content");

  const abilities = extractNames(pokemon.abilities, "ability");
  const types = extractNames(pokemon.types, "type");
  const weight = pokemon.weight;
  const height = pokemon.height;

  fetchMoveHtml(pokemon.moves).then((moveHtml) => {
    modalContent.innerHTML = createModalContent(pokemon,abilities,types,weight,height,moveHtml);
    modal.style.display = "block";
    document.body.style.backgroundColor = "lightgrey";
    document.getElementById("pokemon-list").style.display = "none";
  });
}

function extractNames(array, key) {
  return (array || [])
    .filter((info) => info && info[key])
    .map((info) => info[key].name)
    .join(", ");
}

function fetchMoveHtml(moves) {
  const movePromises = (moves || []).slice(0, 5).map(({ move }) =>
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

function createModalContent(pokemon,abilities,types,weight,height,moveHtml) {
  return `${createHeader(pokemon.name)}
  ${createCard(pokemon.sprites.front_default,abilities,types,weight,height,moveHtml)}`;
}

function createHeader(name) {
  return `<h5 class="card-title">${name}</h5>`;
}

function createCard(imgSrc, abilities, types, weight, height, moveHtml) {
  return `<div class="card" style="width: 18rem;">
    <div class="card-body"><img src="${imgSrc}" class="card-img-top" >${createTable(abilities,types,weight,height)}
    </div>
    ${moveHtml.join("")}
    ${createButtons()}</div>`;
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

function createButtons() {
  return `<button class="btn btn-danger position-btn-right" onclick="next()">-></button>
  <button class="btn btn-danger position-btn-left" onclick="back()"><-</button>`;
}

function navigatePokemon(direction) {
  let newIndex = currentPokemonIndex + direction;
  if (newIndex >= 0 && newIndex < pokemonList.length) {
    currentPokemonIndex = newIndex;
    detailPokemon(pokemonList[newIndex]);
  } else {
    console.warn("Navigation out of bounds", newIndex);
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
    const index = pokemonList.indexOf(pokemon); // Den richtigen Index im Original-Array finden
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const typesString = types.join(", ");
    const className = ifRequest(types);

    const pokemonDiv = createPokemonDiv(index, pokemon, typesString, className);
    pokemonDiv.addEventListener("click", () => detailPokemon(pokemon));
    pokemonContainer.appendChild(pokemonDiv);
  });
}

