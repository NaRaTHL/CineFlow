document.addEventListener("DOMContentLoaded", () => {
  const IMG_URL = 'https://image.tmdb.org/t/p/w500';

  const tabs = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab');

  // --- Tab switching ---
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('border-red-600', 'text-red-500'));
      tabContents.forEach(tab => tab.classList.add('hidden'));

      btn.classList.add('border-red-600', 'text-red-500');
      document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
  });

  // --- Load Data from LocalStorage ---
  // --- Load Data ---
const watched = JSON.parse(localStorage.getItem('watched')) || [];
const rated = JSON.parse(localStorage.getItem('ratedMovies')) || [];
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Combine watched + rated into portfolio
const portfolio = watched.map(movie => {
  const ratedMatch = rated.find(r => r.id === movie.id);
  return ratedMatch ? { ...movie, ...ratedMatch } : movie;
});

// Render portfolio immediately
renderPortfolio(portfolio);

// Render watchlist **only when its tab is clicked**
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'watchlist') {
      renderWatchlist(watchlist);
    }
  });
});

// --- Portfolio Renderer ---
function renderPortfolio(movies) {
  const container = document.getElementById('portfolio');
  if (!movies.length) {
    container.innerHTML = `<p class="text-gray-400 text-center">No movies in your portfolio yet.</p>`;
    return;
  }

  container.innerHTML = '';

  // 2 movies per row grid
  container.className = "grid grid-cols-1 md:grid-cols-2 gap-8";

  movies.forEach(movie => {
    const poster = movie.poster_path
      ? `${IMG_URL}${movie.poster_path}`
      : 'https://placehold.co/400x600?text=No+Image';
    const title = movie.title || movie.name || 'Untitled';
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : movie.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : '';
    const formattedTitle = year ? `${title} (${year})` : title;

    const review = movie.userRating
      ? `
        <div class="space-y-2">
          <p class="text-sm"><span class="font-semibold text-red-500">Rating:</span> ${movie.userRating}/100</p>
          <p class="text-sm text-gray-400">📅 ${movie.watchedDate || 'Unknown date'}</p>
          <p class="italic text-gray-400">"${movie.userComment || 'No comment'}"</p>
        </div>
      `
      : `<p class="text-gray-400 italic text-sm">No review yet.</p>`;

    const card = document.createElement('div');
    card.className =
  "bg-gray-900 p-4 rounded-lg shadow-lg hover:shadow-xl transition";

card.innerHTML = `
  <div class="flex gap-4">
    <!-- Poster -->
    <div class="flex-shrink-0">
      <img src="${poster}" alt="${title}" class="w-60 h-80 rounded-lg object-cover">
    </div>

    <!-- Details -->
    <div class="flex flex-col justify-between flex-1">
      <div>
        <!-- Title: limit to 2 lines -->
        <h3 class="text-xl font-semibold mb-2 line-clamp-2 h-20 overflow-hidden">
          ${formattedTitle}
        </h3>

        <!-- Review info starts below title -->
        <div class="mt-1">
          ${review}
        </div>
      </div>

      <div class="mt-4">
        <button class="review-btn px-3 py-1 rounded text-sm font-semibold ${
          movie.userRating ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
        }">
          ✎ ${movie.userRating ? 'Edit Review' : 'Add Review'}
        </button>
         <button class="remove-portfolio-btn px-3 py-1 rounded text-sm font-semibold bg-red-600 hover:bg-red-700 text-white">
          ✕ Remove
        </button>
      </div>
    </div>
  </div>
`;
    const reviewBtn = card.querySelector('.review-btn');
    reviewBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openReviewModal(movie, !!movie.userRating);
    });

    container.appendChild(card);

    const removeBtn = card.querySelector('.remove-portfolio-btn');
    removeBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      openRemoveModal(movie);
    });

  });
}

// --- Watchlist Renderer ---
function renderWatchlist(movies) {
  const container = document.getElementById('watchlist');
  if (!movies.length) {
    container.innerHTML = `<p class="col-span-full text-gray-400 text-center">No movies in your watchlist.</p>`;
    return;
  }

  container.innerHTML = '';
  container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6';

  movies.forEach(movie => {
    const poster = movie.poster_path
      ? `${IMG_URL}${movie.poster_path}`
      : 'https://placehold.co/400x600?text=No+Image';
    const title = movie.title || movie.name || 'Untitled';
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : '';
    const formattedTitle = year ? `${title} (${year})` : title;

    const card = document.createElement('div');
    card.className = 'relative group';
    card.innerHTML = `
      <div class="relative overflow-hidden rounded-lg shadow-lg">
        <img src="${poster}" alt="${title}" class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
      </div>
      <p class="mt-2 text-sm font-medium text-center">${formattedTitle}</p>
      <button class="remove-btn absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded hidden group-hover:block">
        ✕ Remove
      </button>
    `;

    const removeBtn = card.querySelector('.remove-btn');
    removeBtn.addEventListener('click', () => {
      const updatedList = movies.filter(m => m.id !== movie.id);
      localStorage.setItem('watchlist', JSON.stringify(updatedList));
      renderWatchlist(updatedList);
    });

    container.appendChild(card);
  });
}

  // --- Review Modal Logic ---
  const modal = document.getElementById('reviewModal');
  const closeModalBtn = document.getElementById('closeModal');
  const saveReviewBtn = document.getElementById('saveReview');
  const ratingInput = document.getElementById('userRating');
  const commentInput = document.getElementById('userComment');
  const watchedDateInput = document.getElementById('watchedDate');

  let currentMovie = null;

  function openReviewModal(movie, isEdit = false) {
    currentMovie = movie;

    const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies')) || [];
    const existing = ratedMovies.find(m => m.id === movie.id);

    if (existing) {
      ratingInput.value = existing.userRating || '';
      commentInput.value = existing.userComment || '';
      watchedDateInput.value = existing.watchedDate || '';
    } else {
      ratingInput.value = '';
      commentInput.value = '';
      watchedDateInput.value = '';
    }

    modal.classList.remove('hidden');
  }


  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  function closeReviewModal() {
  modal.classList.add('hidden');
  ratingInput.value = '';
  commentInput.value = '';
  watchedDateInput.value = '';
  currentMovie = null;
}


  document.getElementById("saveReview").addEventListener("click", () => {
  const watchedDate = document.getElementById("watchedDate").value;
  const userRating = document.getElementById("userRating").value;
  const userComment = document.getElementById("userComment").value;

  if (!currentMovie) return;

  // Load from localStorage
  let watched = JSON.parse(localStorage.getItem("watched")) || [];
  let rated = JSON.parse(localStorage.getItem("ratedMovies")) || [];

  // Update or add to watched
  const watchedIndex = watched.findIndex(m => m.id === currentMovie.id);
  const movieData = {
    ...currentMovie,
    watchedDate,
    userRating,
    userComment
  };

  if (watchedIndex >= 0) {
    watched[watchedIndex] = movieData;
  } else {
    watched.push(movieData);
  }

  // Update or add to rated
  const ratedIndex = rated.findIndex(m => m.id === currentMovie.id);
  if (ratedIndex >= 0) {
    rated[ratedIndex] = movieData;
  } else {
    rated.push(movieData);
  }

  // Save back to localStorage
  localStorage.setItem("watched", JSON.stringify(watched));
  localStorage.setItem("ratedMovies", JSON.stringify(rated));

  // Close modal and refresh portfolio
  closeReviewModal();
  const portfolio = watched.map(movie => {
    const ratedMatch = rated.find(r => r.id === movie.id);
    return ratedMatch ? { ...movie, ...ratedMatch } : movie;
  });
  renderPortfolio(portfolio);
});

// --- Remove Modal Logic ---
const removeModal = document.getElementById('removeModal');
const confirmRemoveBtn = document.getElementById('confirmRemove');
const cancelRemoveBtn = document.getElementById('cancelRemove');
let movieToRemove = null;

function openRemoveModal(movie) {
  movieToRemove = movie;
  removeModal.classList.remove('hidden');
}

function closeRemoveModal() {
  movieToRemove = null;
  removeModal.classList.add('hidden');
}

cancelRemoveBtn.addEventListener('click', closeRemoveModal);

confirmRemoveBtn.addEventListener('click', () => {
  if (!movieToRemove) return;

  // Remove from LocalStorage
  let watched = JSON.parse(localStorage.getItem('watched')) || [];
  let rated = JSON.parse(localStorage.getItem('ratedMovies')) || [];

  watched = watched.filter(m => m.id !== movieToRemove.id);
  rated = rated.filter(m => m.id !== movieToRemove.id);

  localStorage.setItem('watched', JSON.stringify(watched));
  localStorage.setItem('ratedMovies', JSON.stringify(rated));

  // Re-render portfolio
  const portfolio = watched.map(m => {
    const ratedMatch = rated.find(r => r.id === m.id);
    return ratedMatch ? { ...m, ...ratedMatch } : m;
  });
  renderPortfolio(portfolio);

  closeRemoveModal();
});


});
