document.addEventListener("DOMContentLoaded", async () => {
  const API_KEY = "e03962f7d0373121b4abd521402d77ae";
  const BASE_URL = "https://api.themoviedb.org/3";
  const IMG_URL = "https://image.tmdb.org/t/p/original";
  const detailsContainer = document.getElementById("movieDetails");

  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get("id"));
  const type = urlParams.get("type") || "movie";

  if (!id) {
    detailsContainer.innerHTML = `<p class="text-center text-red-500">No ID provided.</p>`;
    return;
  }

  // ===== LocalStorage Helpers =====
  function toggleMovieInList(listKey, movie) {
    const list = JSON.parse(localStorage.getItem(listKey)) || [];
    const index = list.findIndex(item => item.id === movie.id);
    if (index >= 0) list.splice(index, 1);
    else list.push(movie);
    localStorage.setItem(listKey, JSON.stringify(list));
  }

  function isInList(listKey, movieId) {
    const list = JSON.parse(localStorage.getItem(listKey)) || [];
    return list.some(item => item.id === movieId);
  }

  try {
    // Fetch data
    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`),
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    const videos = await videosRes.json();

    const title = details.title || details.name;
    const releaseYear =
      details.release_date?.slice(0, 4) ||
      details.first_air_date?.slice(0, 4) ||
      "N/A";

    const genres = details.genres?.map(g => g.name).join(", ") || "Unknown";
    const overview = details.overview || "No description available.";
    const poster = details.poster_path
      ? `${IMG_URL}${details.poster_path}`
      : "https://placehold.co/400x600?text=No+Image";
    const cast = credits.cast?.slice(0, 6) || [];
    const trailer = videos.results?.find(
      v => v.type === "Trailer" && v.site === "YouTube"
    );

    const movieData = {
      id,
      title,
      poster_path: details.poster_path,
      release_date: details.release_date,
      vote_average: details.vote_average,
      type,
    };

    const inWatchlist = isInList("watchlist", id);
    const inWatched = isInList("watched", id);

    const extraInfo =
      type === "tv"
        ? `<p class="text-gray-400 mb-2">
            Seasons: ${details.number_of_seasons || "N/A"} • Episodes: ${
            details.number_of_episodes || "N/A"
          }
          </p>`
        : "";

    // ===== Build HTML =====
    detailsContainer.innerHTML = `
      <section class="flex flex-col md:flex-row gap-10">
        <img src="${poster}" alt="${title}"
          class="w-full md:w-1/3 lg:w-1/4 max-h-[600px] object-cover rounded-2xl shadow-2xl mx-auto md:mx-0">

        <div class="flex-1">
          <h1 class="text-4xl font-bold mb-1">${title}</h1>

          <!-- Rating, Release Year, and Genres -->
          <p class="text-gray-400 mb-3 flex items-center gap-2">
            <span class="text-white-500 font-semibold">
              ${details.vote_average ? Math.round(details.vote_average * 10) : "N/A"}/100
            </span>
            <span>• ${releaseYear}</span>
            <span>• ${genres}</span>
          </p>

          ${extraInfo}

          <p class="text-gray-300 leading-relaxed mb-6">${overview}</p>

          <!-- Buttons -->
          <div class="flex gap-3 mb-8">
            <button id="watchlistBtn"
              class="px-4 py-2 rounded-lg font-medium transition-transform active:scale-95 ${
                inWatchlist
                  ? "bg-red-600"
                  : "bg-gray-800 hover:bg-red-600"
              }">
              ${
                inWatchlist
                  ? "✓ In Watchlist"
                  : "+ Add to Watchlist"
              }
            </button>

            <button id="watchedBtn"
              class="px-4 py-2 rounded-lg font-medium transition-transform active:scale-95 ${
                inWatched
                  ? "bg-green-600"
                  : "bg-gray-800 hover:bg-green-600"
              }">
              ${
                inWatched
                  ? "✓ Watched"
                  : "Mark as Watched"
              }
            </button>
          </div>

          <div class="mb-6">
            <h2 class="text-2xl font-semibold mb-2">Cast</h2>
            <div class="flex gap-4 overflow-x-auto pb-2">
              ${
                cast.length
                  ? cast
                      .map(
                        actor => `
                    <div class="w-28 flex-shrink-0 text-center">
                      <img src="${
                        actor.profile_path
                          ? "https://image.tmdb.org/t/p/w185" +
                            actor.profile_path
                          : "https://placehold.co/185x278?text=No+Image"
                      }"
                        alt="${actor.name}" class="rounded-lg mb-2">
                      <p class="text-sm font-medium">${actor.name}</p>
                      <p class="text-xs text-gray-400">${
                        actor.character || ""
                      }</p>
                    </div>
                  `
                      )
                      .join("")
                  : "<p class='text-gray-400'>No cast information available.</p>"
              }
            </div>
          </div>

          ${
            trailer
              ? `
              <div class="mt-8">
                <h2 class="text-2xl font-semibold mb-4">Trailer</h2>
                <iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}"
                  frameborder="0" allowfullscreen></iframe>
              </div>
            `
              : ""
          }
        </div>
      </section>
    `;

    // ===== Button Logic =====
    const watchlistBtn = document.getElementById("watchlistBtn");
    const watchedBtn = document.getElementById("watchedBtn");

    watchlistBtn.addEventListener("click", () => {
      toggleMovieInList("watchlist", movieData);
      const inList = isInList("watchlist", id);
      watchlistBtn.textContent = inList ? "✓ In Watchlist" : "+ Add to Watchlist";
      watchlistBtn.className = `px-4 py-2 rounded-lg font-medium transition-transform active:scale-95 ${
        inList ? "bg-red-600" : "bg-gray-800 hover:bg-red-600"
      }`;
    });

    watchedBtn.addEventListener("click", () => {
      toggleMovieInList("watched", movieData);
      const inList = isInList("watched", id);
      watchedBtn.textContent = inList ? "✓ Watched" : "Mark as Watched";
      watchedBtn.className = `px-4 py-2 rounded-lg font-medium transition-transform active:scale-95 ${
        inList ? "bg-green-600" : "bg-gray-800 hover:bg-green-600"
      }`;
    });
  } catch (err) {
    console.error(err);
    detailsContainer.innerHTML = `<p class="text-center text-red-500">Failed to load details.</p>`;
  }
});
