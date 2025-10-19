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
  const watched = JSON.parse(localStorage.getItem('watched')) || [];
  const rated = JSON.parse(localStorage.getItem('ratedMovies')) || [];
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

  renderSection('history', watched, true);
  renderSection('rated', rated, true);
  renderSection('watchlist', watchlist, false);

  // --- Render a section ---
  function renderSection(id, movies, showRating = false) {
    const container = document.getElementById(id);

    if (!movies.length) {
      container.innerHTML = `<p class="col-span-full text-gray-400 text-center">No movies yet.</p>`;
      return;
    }

    container.innerHTML = '';
    // Create grid wrapper
    const grid = document.createElement('div');
    grid.className = id === 'rated'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      : 'grid grid-cols-2 md:grid-cols-4 gap-4';


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
      const type = movie.title ? 'movie' : 'tv';
      const basePath = window.location.pathname.includes('/page/') ? '../' : './';

      // Movie card HTML
        const card = document.createElement('div');

        // Custom layout for the Rated section
        if (id === 'rated') {
          card.className = 'relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:scale-105';
          card.innerHTML = `
            <div class="relative">
              <img src="${poster}" alt="${title}" class="w-full object-cover">

              <!-- Blue rating circle at top-right -->
              <div class="absolute top-2 right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white shadow-md">
                ${movie.userRating ?? '–'}
              </div>

              <!-- Remove button at top-left -->
              <button class="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded-md text-xs font-semibold text-white hover:bg-red-700 transition remove-rated-btn">
                ✕
              </button>
            </div>

            <div class="p-3">
              <h3 class="text-sm font-semibold text-white mb-2">${formattedTitle}</h3>

              <!-- Watched date -->
              <p class="text-gray-300 text-xs mb-1">
                ${movie.watchedDate ? `Watched: ${movie.watchedDate}` : '–'}
              </p>

              <!-- Comment -->
              <p class="italic text-gray-400 text-xs">
                ${movie.userComment ? `"${movie.userComment}"` : 'No comment'}
              </p>
            </div>
          `;

          // Add remove button functionality
            const removeBtn = card.querySelector('.remove-rated-btn');
            removeBtn.addEventListener('click', e => {
              e.preventDefault();
              e.stopPropagation();

              // Remove from ratedMovies
              const updatedList = movies.filter(m => m.id !== movie.id);
              localStorage.setItem('ratedMovies', JSON.stringify(updatedList));

              // Update watched history: mark as not reviewed
              const watchedHistory = JSON.parse(localStorage.getItem('watched')) || [];
              const updatedHistory = watchedHistory.map(m => {
                if (m.id === movie.id) {
                  return { ...m, reviewed: false }; // optional flag if you track review status
                }
                return m;
              });
              localStorage.setItem('watched', JSON.stringify(updatedHistory));

              // Re-render sections
              renderSection('rated', updatedList, true);
              renderSection('history', updatedHistory, true);
            });
        }

 else {
          // Default layout (for watched, watchlist, etc.)
          card.className = 'relative group';
          card.innerHTML = `
            <a href="${basePath}page/detail.html?id=${movie.id}&type=${type}" class="block">
              <div class="relative overflow-hidden rounded-lg shadow-lg">
                <img src="${poster}" alt="${title}" class="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110">
              </div>
              <p class="mt-2 text-sm font-medium text-center">${formattedTitle}</p>
              ${
                showRating && movie.userRating
                  ? `
                    <div class="text-xs text-gray-400 text-center mt-1">
                      ${movie.userRating}/100
                      ${movie.watchedDate ? `<p class="mt-1 text-gray-500">📅 Watched: ${movie.watchedDate}</p>` : ''}
                      ${movie.userComment ? `<p class="italic mt-1 text-gray-500">"${movie.userComment}"</p>` : ''}
                    </div>
                  `
                  : ''
              }
            </a>
          `;
        }
      // Add remove button for Watchlist
      if (id === 'watchlist') {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.className = 'remove-btn absolute top-2 right-2 bg-red-600 p-1 rounded-md text-white';
        removeBtn.addEventListener('click', e => {
          e.preventDefault();
          e.stopPropagation();
          const updatedList = movies.filter(m => m.id !== movie.id);
          localStorage.setItem('watchlist', JSON.stringify(updatedList));
          renderSection('watchlist', updatedList, false);
        });
        card.appendChild(removeBtn);
      }

      // Add review button for watched movies
      if (id === 'history') {
        const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies')) || [];
        const alreadyReviewed = ratedMovies.some(r => r.id === movie.id);

        const reviewBtn = document.createElement('button');
        reviewBtn.textContent = alreadyReviewed ? 'Reviewed' : '✎ Review';
        reviewBtn.className = alreadyReviewed
          ? 'absolute top-2 right-2 bg-green-600 px-2 py-1 rounded-md text-xs font-semibold text-white cursor-default'
          : 'absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-xs font-semibold text-white transition';

        if (!alreadyReviewed) {
          reviewBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openReviewModal(movie);
          });
        } else {
          // Optionally allow editing reviewed movies:
          reviewBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            openReviewModal(movie, true); // Pass edit mode
          });
        }

        card.appendChild(reviewBtn);
      }


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

  saveReviewBtn.addEventListener('click', () => {
    const rating = parseInt(ratingInput.value);
    const comment = commentInput.value.trim();
    const watchedDate = watchedDateInput.value;

    if (isNaN(rating) || rating < 0 || rating > 100) {
      alert('Please enter a rating between 0 and 100.');
      return;
    }

    if (!comment) {
      alert('Please write a comment.');
      return;
    }

    if (!watchedDate) {
      alert('Please select the watched date.');
      return;
    }

    // Save to ratedMovies
    const ratedMovies = JSON.parse(localStorage.getItem('ratedMovies')) || [];
    const existing = ratedMovies.find(m => m.id === currentMovie.id);

    if (existing) {
      existing.userRating = rating;
      existing.userComment = comment;
      existing.watchedDate = watchedDate;
    } else {
      ratedMovies.push({
        ...currentMovie,
        userRating: rating,
        userComment: comment,
        watchedDate: watchedDate
      });
    }

    localStorage.setItem('ratedMovies', JSON.stringify(ratedMovies));
    modal.classList.add('hidden');

    // Re-render the rated section
    renderSection('rated', ratedMovies, true);
    renderSection('history', JSON.parse(localStorage.getItem('watched')) || [], true);
  });
});
