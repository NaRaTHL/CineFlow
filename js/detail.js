document.addEventListener("DOMContentLoaded", async () => {
  const API_KEY = 'e03962f7d0373121b4abd521402d77ae';
  const BASE_URL = 'https://api.themoviedb.org/3';
  const IMG_URL = 'https://image.tmdb.org/t/p/original';
  const detailsContainer = document.getElementById("movieDetails");

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const type = urlParams.get('type') || 'movie'; // movie or tv

  if (!id) {
    detailsContainer.innerHTML = `<p class="text-center text-red-500">No ID provided.</p>`;
    return;
  }

  try {
    // Fetch details, credits, and videos (for either movie or TV)
    const [detailsRes, creditsRes, videosRes] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`)
    ]);

    const details = await detailsRes.json();
    const credits = await creditsRes.json();
    const videos = await videosRes.json();

    const title = details.title || details.name;
    const releaseYear = details.release_date
      ? details.release_date.slice(0, 4)
      : details.first_air_date
      ? details.first_air_date.slice(0, 4)
      : 'N/A';

    const genres = details.genres?.map(g => g.name).join(', ') || 'Unknown';
    const overview = details.overview || 'No description available.';
    const poster = details.poster_path
      ? `${IMG_URL}${details.poster_path}`
      : 'https://placehold.co/400x600?text=No+Image';

    const cast = credits.cast?.slice(0, 6) || [];
    const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    // Optional: if it's a TV show, show number of seasons/episodes
    const extraInfo =
      type === 'tv'
        ? `<p class="text-gray-400 mb-2">
            Seasons: ${details.number_of_seasons || 'N/A'} • Episodes: ${details.number_of_episodes || 'N/A'}
          </p>`
        : '';

    detailsContainer.innerHTML = `
      <section class="flex flex-col md:flex-row gap-10">
        <img src="${poster}" alt="${title}" 
          class="w-full md:w-1/3 lg:w-1/4 max-h-[600px] object-cover rounded-2xl shadow-2xl mx-auto md:mx-0">

        <div class="flex-1">
          <h1 class="text-4xl font-bold mb-2">${title}</h1>
          <p class="text-gray-400 mb-2">${releaseYear} • ${genres}</p>
          ${extraInfo}
          <p class="text-gray-300 leading-relaxed mb-6">${overview}</p>

          <div class="mb-6">
            <h2 class="text-2xl font-semibold mb-2">Cast</h2>
            <div class="flex gap-4 overflow-x-auto pb-2">
              ${
                cast.length
                  ? cast.map(actor => `
                    <div class="w-28 flex-shrink-0 text-center">
                      <img src="${actor.profile_path
                        ? 'https://image.tmdb.org/t/p/w185' + actor.profile_path
                        : 'https://placehold.co/185x278?text=No+Image'}" 
                        alt="${actor.name}" class="rounded-lg mb-2">
                      <p class="text-sm font-medium">${actor.name}</p>
                      <p class="text-xs text-gray-400">${actor.character || ''}</p>
                    </div>
                  `).join('')
                  : '<p class="text-gray-400">No cast information available.</p>'
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
              : ''
          }
        </div>
      </section>
    `;
  } catch (err) {
    console.error(err);
    detailsContainer.innerHTML = `<p class="text-center text-red-500">Failed to load details.</p>`;
  }
});
