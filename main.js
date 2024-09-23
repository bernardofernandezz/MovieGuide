const movieNameRef = document.getElementById("movie-name");
const searchBtn = document.getElementById("search-btn");
const result = document.getElementById("result");
const suggestionsContainer = document.getElementById("suggestions");
const key = "3cda63dc";

let debounceTimer;
const cache = {};

const searchMovies = async (searchTerm) => {
  if (cache[searchTerm]) {
    return cache[searchTerm];
  }

  const url = `https://www.omdbapi.com/?s=${searchTerm}&apikey=${key}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Dados da busca:", data); // Log para depuração
    cache[searchTerm] = data.Search || [];
    return cache[searchTerm];
  } catch (error) {
    console.error("Erro ao buscar sugestões:", error);
    return [];
  }
};

const showSuggestions = (suggestions) => {
  suggestionsContainer.innerHTML = "";
  if (suggestions.length > 0) {
    for (const movie of suggestions) {
      const div = document.createElement("div");
      div.textContent = movie.Title;
      div.className = "p-2 hover:bg-slate-600 cursor-pointer";
      div.onclick = () => {
        movieNameRef.value = movie.Title;
        suggestionsContainer.classList.add("hidden");
        getMovie();
      };
      suggestionsContainer.appendChild(div);
    }
    suggestionsContainer.classList.remove("hidden");
  } else {
    suggestionsContainer.classList.add("hidden");
  }
};

const debouncedSearch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const searchTerm = movieNameRef.value;
    if (searchTerm.length > 2) {
      const suggestions = await searchMovies(searchTerm);
      showSuggestions(suggestions);
    } else {
      suggestionsContainer.classList.add("hidden");
    }
  }, 300);
};

//function to fetch data from api

const getMovie = () => {
  const movieName = movieNameRef.value;
  console.log("movieName", movieName);
  const url = `https://www.omdbapi.com/?t=${movieName}&apikey=${key}`; // Alterado para https
  console.log("url", url);
  //if input field is empty

  if (movieName.length <= 0) {
    result.innerHTML = `<h3 class="msg">Please enter a movie name </h3>`;
  }

  //if input isn't empty
  else {
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        console.log("Dados do filme:", data); // Log para depuração
        //if movie exist in database
        if (data.Response === "True") {
          result.innerHTML = `
                    <div class="info">
                        <img src=${data.Poster} class="poster">
                        <div>
                            <h2>${data.Title}</h2>
                            <div class="rating">
                                <img src="star-icon.svg">
                                <h4>${data.imdbRating}</h4>
                            </div>
                            <div class="details">
                                <span>${data.Rated}</span>
                                <span>${data.Year}</span>
                                <span>${data.Runtime}</span>
                            </div>
                            <div class="genre">
                                <div>${data.Genre.split(",").join(
                                  "</div><div>"
                                )}</div>
                            </div>
                        </div>
                    </div>
                    <h3>Plot:</h3>
                    <p>${data.Plot}</p>
                    <h3>Cast:</h3>
                    <p>${data.Actors}</p>
                `;
        }

        //if movie doesn't exist in database
        else {
          result.innerHTML = `<h3 class="msg">${data.Error}</h3>`;
        }
      })
      //if error occurs
      .catch(() => {
        result.innerHTML = `<h3 class="msg">Error Occured</h3>`;
      });
  }
};

//console.log("movieName", movieName.length);
//if (movieName.length > 0) {
//  getMovie();
//}

movieNameRef.addEventListener("input", debouncedSearch);
searchBtn.addEventListener("click", getMovie);
window.addEventListener("load", getMovie);

// Fechar sugestões ao clicar fora
document.addEventListener("click", (e) => {
  if (!suggestionsContainer.contains(e.target) && e.target !== movieNameRef) {
    suggestionsContainer.classList.add("hidden");
  }
});
