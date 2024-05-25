let pokemonList = [];
let currentIndex = 1;

async function init() {
  for (let i = 1; i < 29; i++) {
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
    const pokemonDiv = document.createElement("div");
    const types = pokemon.types.map((typeInfo) => typeInfo.type.name);
    const typesString = types.join("<p>");
    const backgroundColor = ifRequest(types);
    pokemonDiv.style.backgroundColor = backgroundColor;

    pokemonDiv.className = "pokemon";
    pokemonDiv.innerHTML = `
            <div class="upperContainer">
                <p>#${i + 1}</p>
                <h3>${pokemon.name}</h3>
            </div>
         <div class="upperC">
            <img src="${pokemon.sprites.front_default}">
            <div class="categoryTypes" onclick="detailPokemon(${i}, ${
      pokemon.name
    }, ${types})">
              <p>${types}</p>
            </div>
        </div>
        `;
    pokemonDiv.addEventListener("click", () => detailPokemon(pokemon));
    pokemonContainer.appendChild(pokemonDiv);
  }
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

function ifRequest(types) {
  if (types.includes("normal") && types.length > 1) {
    types = types.filter((type) => type !== "normal");
  } else if (types.length === 1 && types[0] === "normal") {
    types = ["brown"];
  }

  let primaryType = types[0];

  let backgroundColor;
  switch (types[0]) {
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
    case "normal,flying":
      backgroundColor = "skyblue";
      break;
    case "fairy":
      backgroundColor = "lightpink";
      break;
    default:
      backgroundColor = "darkblue";
  }
  return backgroundColor;
}

function detailPokemon(pokemon) {
  const modal = document.getElementById("pokemon-modal");
  const modalContent = document.getElementById("pokemon-modal-content");

  const abilities = pokemon.abilities
    .map((abilityInfo) => abilityInfo.ability.name)
    .join(", ");
  const weight = pokemon.weight;
  const height = pokemon.height;
  const types = pokemon.types.map((typeInfo) => typeInfo.type.name).join(", ");

  const movePromises = pokemon.moves.slice(0, 5).map((moveInfo) => {
    const moveName = moveInfo.move.name;
    const moveUrl = moveInfo.move.url;

    return fetch(moveUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch move data for ${moveName}`);
        }
        return response.json();
      })
      .then((moveData) => {
        const power = moveData.power || 0;
        return `
                  <div>
                 
                      <p>${moveName}</p>
                      <div class="progress" role="progressbar" aria-label="${moveName}" aria-valuenow="${power}" aria-valuemin="0" aria-valuemax="100">
                          <div class="progress-bar" style="width: ${power}%">${power}</div>
                      </div>
                  </div>
              `;
      })
      .catch((error) => {
        console.error(error);
        return `<p>${moveName}: Unable to fetch move data</p>`;
      });
  });

  Promise.all(movePromises).then((moveHtml) => {
    modalContent.innerHTML = `
          <h5 class="card-title">${pokemon.name}</h5>
          <div class="card" style="width: 18rem;">
              <div class="card-body">
              <img src="${pokemon.sprites.front_default}" class="card-img-top">
                  <table class="table table-borderless">
                      <tr>
                          <td>Types</td>
                          <td>${types}</td>
                      </tr>
                      <tr>
                          <td>Weight</td>
                          <td>${weight}</td>
                      </tr>
                      <tr>
                          <td>Height</td>
                          <td>${height}</td>
                      </tr>
                      <tr>
                          <td>Abilities</td>
                          <td>${abilities}</td>
                      </tr>
                  </table>
              </div>
              ${moveHtml.join("")}
          </div>
          <button class="btn btn-danger position-btn-right">Right</button>
          <button class="btn btn-danger position-btn-left">Left</button>
      `;
    modal.style.display = "block";
    document.body.style.backgroundColor = "lightgrey";
    document.getElementById("pokemon-list").style.display = "none";
  });
}

function closeModal() {
  const modal = document.getElementById("pokemon-modal");
  modal.style.display = "none";
  document.body.style.backgroundColor = "white";
  document.getElementById("pokemon-list").style.display = "";
}
