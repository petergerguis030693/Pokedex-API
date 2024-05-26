let pokemonList = [];
let currentIndex = 1;
let currentPokemonIndex = 0;

async function init() {
  for (let i = 1; i < 41; i++) {
    await loadPokemon(i);
  }
  renderPokemon();
}

async function loadPokemon(i) {
  let url = `https://pokeapi.co/api/v2/pokemon/${i}`;
  let response = await fetch(url);
  let pokemon = await response.json();
  pokemonList.push(pokemon);
}

function renderPokemon() {
  const pokemonContainer = document.getElementById("pokemon-list");
  pokemonContainer.innerHTML = "";

  for (let i = 0; i < pokemonList.length; i++) {
    const pokemon = pokemonList[i];
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const typesString = types.join(", ");
    const backgroundColor = ifRequest(types);

    const pokemonDiv = createPokemonDiv(
      i,
      pokemon,
      typesString,
      backgroundColor
    );
    pokemonDiv.addEventListener("click", () => {
      currentPokemonIndex = i;
      detailPokemon(pokemon);
    });

    pokemonContainer.appendChild(pokemonDiv);
  }
}

function createPokemonDiv(index, pokemon, typesString, backgroundColor) {
  const pokemonDiv = document.createElement("div");
  pokemonDiv.style.backgroundColor = backgroundColor;
  pokemonDiv.className = "pokemon";
  pokemonDiv.innerHTML = createPokemonCardHtml(
    index,
    pokemon.name,
    pokemon.sprites.front_default,
    typesString
  );
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
    modalContent.innerHTML = createModalContent(
      pokemon,
      abilities,
      types,
      weight,
      height,
      moveHtml
    );
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

function createModalContent(
  pokemon,
  abilities,
  types,
  weight,
  height,
  moveHtml
) {
  return `${createHeader(pokemon.name)}
  ${createCard(
    pokemon.sprites.front_default,
    abilities,
    types,
    weight,
    height,
    moveHtml
  )}`;
}

function createHeader(name) {
  return `<h5 class="card-title">${name}</h5>`;
}

function createCard(imgSrc, abilities, types, weight, height, moveHtml) {
  return `<div class="card" style="width: 18rem;">
    <div class="card-body"><img src="${imgSrc}" class="card-img-top" >${createTable(
    abilities,
    types,
    weight,
    height
  )}</div>
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
    types = ["brown"];
  }

  let primaryType = types[0];

  let backgroundColor;
  switch (primaryType) {
    case "fire":
      backgroundColor = "red";
      break;
    case "grass":
      backgroundColor = "green";
      break;
    case "water":
      backgroundColor = "blue";
      break;
    case "electric":
      backgroundColor = "yellow";
      break;
    case "ice":
      backgroundColor = "lightblue";
      break;
    case "fighting":
      backgroundColor = "orange";
      break;
    case "poison":
      backgroundColor = "purple";
      break;
    case "ground":
      backgroundColor = "brown";
      break;
    case "flying":
      backgroundColor = "skyblue";
      break;
    case "psychic":
      backgroundColor = "pink";
      break;
    case "bug":
      backgroundColor = "limegreen";
      break;
    case "rock":
      backgroundColor = "gray";
      break;
    case "ghost":
      backgroundColor = "indigo";
      break;
    case "dragon":
      backgroundColor = "darkblue";
      break;
    case "dark":
      backgroundColor = "black";
      break;
    case "steel":
      backgroundColor = "silver";
      break;
    case "fairy":
      backgroundColor = "lightpink";
      break;
    default:
      backgroundColor = "darkblue";
  }
  return backgroundColor;
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

  for (let i = 0; i < filteredPokemon.length; i++) {
    const pokemon = filteredPokemon[i];
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const typesString = types.join(", ");
    const backgroundColor = ifRequest(types);

    const pokemonDiv = createPokemonDiv(
      i,
      pokemon,
      typesString,
      backgroundColor
    );
    pokemonDiv.addEventListener("click", () => detailPokemon(pokemon));
    pokemonContainer.appendChild(pokemonDiv);
  }
}
