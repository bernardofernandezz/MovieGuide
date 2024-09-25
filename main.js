const refNomeFilme = document.getElementById("movie-name");
const btnPesquisar = document.getElementById("search-btn");
const resultado = document.getElementById("result");
const containerSugestoes = document.getElementById("suggestions");
const chave = "3cda63dc";

let temporizadorDebounce;
const cache = {};

const pesquisarFilmes = async (termoPesquisa) => {
  if (cache[termoPesquisa]) {
    return cache[termoPesquisa];
  }

  const url = `https://www.omdbapi.com/?s=${termoPesquisa}&apikey=${chave}`;
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();
    cache[termoPesquisa] = dados.Search || [];
    return cache[termoPesquisa];
  } catch (erro) {
    console.error("Erro ao buscar sugestões:", erro);
    return [];
  }
};

const mostrarSugestoes = (sugestoes) => {
  containerSugestoes.innerHTML = "";
  if (sugestoes.length > 0) {
    for (const filme of sugestoes) {
      const div = document.createElement("div");
      div.textContent = filme.Title;
      div.className = "p-2 hover:bg-slate-600 cursor-pointer";
      div.onclick = () => {
        refNomeFilme.value = filme.Title;
        containerSugestoes.classList.add("hidden");
        obterFilme();
      };
      containerSugestoes.appendChild(div);
    }
    containerSugestoes.classList.remove("hidden");
  } else {
    containerSugestoes.classList.add("hidden");
  }
};

const pesquisaComDebounce = () => {
  clearTimeout(temporizadorDebounce);
  resultado.innerHTML = "";
  temporizadorDebounce = setTimeout(async () => {
    const termoPesquisa = refNomeFilme.value.trim();
    if (termoPesquisa.length > 2) {
      resultado.innerHTML = "<p>Buscando...</p>";
      const sugestoes = await pesquisarFilmes(termoPesquisa);
      mostrarSugestoes(sugestoes);
    } else {
      containerSugestoes.classList.add("hidden");
    }
  }, 700);
};

// Função para buscar dados da API
const obterFilme = async () => {
  const nomeFilme = refNomeFilme.value.trim();
  if (nomeFilme.length <= 0) {
    resultado.innerHTML = `<h3 class="msg">Por favor, digite o nome de um filme</h3>`;
    return;
  }

  resultado.innerHTML = "<p>Carregando...</p>";
  const url = `https://www.omdbapi.com/?t=${nomeFilme}&apikey=${chave}`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();
    if (dados.Response === "True") {
      resultado.innerHTML = `
                    <div class="info">
                        <img src=${dados.Poster} class="poster">
                        <div>
                            <h2>${dados.Title}</h2>
                            <div class="rating">
                                <img src="star-icon.svg">
                                <h4>${dados.imdbRating}</h4>
                            </div>
                            <div class="details">
                                <span>${dados.Rated}</span>
                                <span>${dados.Year}</span>
                                <span>${dados.Runtime}</span>
                            </div>
                            <div class="genre">
                                <div>${dados.Genre.split(",").join(
                                  "</div><div>"
                                )}</div>
                            </div>
                        </div>
                    </div>
                    <h3>Enredo:</h3>
                    <p>${dados.Plot}</p>
                    <h3>Elenco:</h3>
                    <p>${dados.Actors}</p>
                `;
    } else {
      resultado.innerHTML = `<h3 class="msg">${dados.Error}</h3>`;
    }
  } catch (erro) {
    console.error("Erro ao buscar filme:", erro);
    resultado.innerHTML = `<h3 class="msg">Ocorreu um erro ao buscar o filme</h3>`;
  }
};

refNomeFilme.addEventListener("input", pesquisaComDebounce);
btnPesquisar.addEventListener("click", obterFilme);
window.addEventListener("load", obterFilme);

// Fechar sugestões ao clicar fora
document.addEventListener("click", (e) => {
  if (!containerSugestoes.contains(e.target) && e.target !== refNomeFilme) {
    containerSugestoes.classList.add("hidden");
  }
});
