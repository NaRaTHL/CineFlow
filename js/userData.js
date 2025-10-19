// User Data Storage
const userDataKey = 'userData';

function getUserData() {
  return JSON.parse(localStorage.getItem(userDataKey)) || { watched: {}, watchlist: {} };
}

function saveUserData(data) {
  localStorage.setItem(userDataKey, JSON.stringify(data));
}

// Watched
function isWatched(id, type) {
  const data = getUserData();
  return !!data.watched[`${type}_${id}`];
}

function toggleWatched(id, type) {
  const data = getUserData();
  const key = `${type}_${id}`;
  if (data.watched[key]) delete data.watched[key];
  else data.watched[key] = true;
  saveUserData(data);
}

// Watchlist
function isInWatchlist(id, type) {
  const data = getUserData();
  return !!data.watchlist[`${type}_${id}`];
}

function toggleWatchlist(id, type) {
  const data = getUserData();
  const key = `${type}_${id}`;
  if (data.watchlist[key]) delete data.watchlist[key];
  else data.watchlist[key] = true;
  saveUserData(data);
}
