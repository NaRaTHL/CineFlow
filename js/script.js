const API_KEY = 'e03962f7d0373121b4abd521402d77ae';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

async function fetchMovies(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&page=1`);
  const data = await res.json();
  return data.results;
}

function renderMovies(movies, containerId, startIndex = 0) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const visibleMovies = movies.slice(startIndex, startIndex + 7);

  visibleMovies.forEach(movie => {
    const imgSrc = movie.poster_path
      ? `${IMG_URL}${movie.poster_path}`
      : 'https://placehold.co/400x600?text=No+Image';
    const title = movie.title || movie.name;
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : movie.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : '';
    const formattedTitle = year ? `${title} (${year})` : title;

    const rating = movie.vote_average * 10;
    let color;
    if (rating < 50) color = 'red';
    else if (rating < 85) color = 'yellow';
    else color = 'green';
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (rating / 100) * circumference;

    const html = `
      <div class="movie-item w-48 flex-shrink-0 group cursor-pointer">
        <div class="overflow-hidden rounded-lg shadow-lg relative">
          <img src="${imgSrc}" alt="${title}" class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
          <svg class="absolute top-2 left-2 w-10 h-10" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="${radius}" stroke="#333" stroke-width="4" fill="none"/>
            <circle cx="20" cy="20" r="${radius}" stroke="${color}" stroke-width="4" fill="none"
              stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
              transform="rotate(-90 20 20)"/>
            <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" font-size="12">${rating.toFixed(0)}%</text>
          </svg>
          <div class="absolute inset-0 bg-black/30"></div>
        </div>
        <h3 class="mt-3 text-sm font-medium text-center leading-tight">${formattedTitle}</h3>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

let movieCache = { recommended: [], popular: [], upcoming: [], tvshows: [] };
let movieIndex = { recommended: 0, popular: 0, upcoming: 0, tvshows: 0 };

async function loadAllMovies() {
  const [recommended, popular, upcoming, tvshows] = await Promise.all([
    fetchMovies('/movie/top_rated'),
    fetchMovies('/movie/popular'),
    fetchMovies('/movie/upcoming'),
    fetchMovies('/tv/popular')
  ]);

  movieCache = {
    recommended: recommended.slice(0, 14),
    popular: popular.slice(0, 14),
    upcoming: upcoming.slice(0, 14),
    tvshows: tvshows.slice(0, 14)
  };

  renderMovies(movieCache.recommended, 'recommended', 0);
  renderMovies(movieCache.popular, 'popular', 0);
  renderMovies(movieCache.upcoming, 'upcoming', 0);
  renderMovies(movieCache.tvshows, 'tvshows', 0);
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.scroll-btn');
  if (!btn) return;

  const target = btn.dataset.target;
  const direction = btn.classList.contains('right') ? 1 : -1;
  const movies = movieCache[target];
  const maxIndex = Math.max(0, movies.length - 7);
  movieIndex[target] = Math.max(0, Math.min(maxIndex, movieIndex[target] + direction * 7));

  renderMovies(movies, target, movieIndex[target]);
});

loadAllMovies();

// Search functionality
    const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
let typingTimeout;

searchInput.addEventListener('input', () => {
  clearTimeout(typingTimeout);
  const query = searchInput.value.trim();

  if (query.length === 0) {
    suggestions.classList.add('hidden');
    suggestions.innerHTML = '';
    return;
  }

  // delay to avoid excessive API calls
  typingTimeout = setTimeout(() => showSuggestions(query), 300);
});

async function showSuggestions(query) {
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const results = data.results
      .filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name))
      .slice(0, 3); // Only show 3 suggestions

    if (results.length === 0) {
      suggestions.classList.add('hidden');
      return;
    }

    suggestions.innerHTML = results.map(item => {
      const title = item.title || item.name;
      const year = item.release_date
        ? new Date(item.release_date).getFullYear()
        : item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : '';
      const formattedTitle = year ? `${title} (${year})` : title;
      const poster = item.poster_path
        ? `${IMG_URL}${item.poster_path}`
        : 'https://placehold.co/60x90?text=No+Image';

      return `
        <li class="flex items-center gap-3 px-4 py-2 hover:bg-red-600 cursor-pointer transition-colors"
            data-title="${title}">
          <img src="${poster}" alt="${title}" class="w-10 h-14 object-cover rounded-md flex-shrink-0">
          <p class="text-sm font-medium text-white leading-tight">${formattedTitle}</p>
        </li>
      `;
    }).join('');

    suggestions.classList.remove('hidden');

    // Handle clicking a suggestion
    document.querySelectorAll('#suggestions li').forEach(li => {
      li.addEventListener('click', () => {
        searchInput.value = li.dataset.title;
        suggestions.classList.add('hidden');
        handleSearch(li.dataset.title);
      });
    });

  } catch (err) {
    console.error('Suggestion error:', err);
  }
}
