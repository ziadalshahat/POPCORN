import axios from 'axios';

const API_KEY  = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

export const IMAGE_BASE   = import.meta.env.VITE_TMDB_IMAGE_BASE;
export const BACKDROP_SIZE = '/original';
export const POSTER_SIZE   = '/w500';
export const THUMB_SIZE    = '/w185';
export const STILL_SIZE    = '/w300'; // for episode stills

// ── Axios instance ──────────────────────────────────────────────
const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: 'en-US' },
});

export const setTMDBLanguage = (lang) => {
  tmdb.defaults.params.language = lang === 'ar' ? 'ar-EG' : 'en-US';
};

// ── Movie Lists ──────────────────────────────────────────────────
export const getTrending = (page = 1) =>
  tmdb.get('/trending/movie/day', { params: { page } });

export const getPopular = (page = 1) =>
  tmdb.get('/movie/popular', { params: { page } });

export const getTopRated = (page = 1) =>
  tmdb.get('/movie/top_rated', { params: { page } });

export const getNowPlaying = (page = 1) =>
  tmdb.get('/movie/now_playing', { params: { page } });

export const getUpcoming = (page = 1) =>
  tmdb.get('/movie/upcoming', { params: { page } });

// ── Movie Details ─────────────────────────────────────────────────
export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, { params: { append_to_response: 'credits' } });

export const getMovieVideos = (id) =>
  tmdb.get(`/movie/${id}/videos`);

export const getSimilarMovies = (id, page = 1) =>
  tmdb.get(`/movie/${id}/similar`, { params: { page } });

// ── TV Show Lists ─────────────────────────────────────────────────
/** Trending TV shows for the day */
export const getTrendingTV = (page = 1) =>
  tmdb.get('/trending/tv/day', { params: { page } });

/** Popular TV shows */
export const getPopularTV = (page = 1) =>
  tmdb.get('/tv/popular', { params: { page } });

/** Top-rated TV shows */
export const getTopRatedTV = (page = 1) =>
  tmdb.get('/tv/top_rated', { params: { page } });

/** On-air TV shows */
export const getOnAirTV = (page = 1) =>
  tmdb.get('/tv/on_the_air', { params: { page } });

// ── TV Show Details ────────────────────────────────────────────────
/** Full TV show details (with credits appended) */
export const getTVDetails = (id) =>
  tmdb.get(`/tv/${id}`, { params: { append_to_response: 'credits' } });

/** Trailers / videos for a TV show */
export const getTVVideos = (id) =>
  tmdb.get(`/tv/${id}/videos`);

/** Episodes for a specific season */
export const getTVSeason = (tvId, seasonNumber) =>
  tmdb.get(`/tv/${tvId}/season/${seasonNumber}`);

/** Similar TV shows */
export const getSimilarTV = (id, page = 1) =>
  tmdb.get(`/tv/${id}/similar`, { params: { page } });

// ── TV Genres & Discover ──────────────────────────────────────────
export const getTVGenres = () =>
  tmdb.get('/genre/tv/list');

export const getTVByGenre = (genreId, page = 1) =>
  tmdb.get('/discover/tv', {
    params: { with_genres: genreId, sort_by: 'popularity.desc', page },
  });

// ── Trending All (movies + TV for hero banner) ────────────────────
export const getTrendingAll = (page = 1) =>
  tmdb.get('/trending/all/day', { params: { page } });

// ── Search ─────────────────────────────────────────────────────────
/** Search movies only */
export const searchMovies = (query, page = 1) =>
  tmdb.get('/search/movie', { params: { query, page } });

/** Search TV shows only */
export const searchTV = (query, page = 1) =>
  tmdb.get('/search/tv', { params: { query, page } });

/** Search movies + TV shows combined (includes media_type field) */
export const searchMulti = (query, page = 1) =>
  tmdb.get('/search/multi', { params: { query, page } });

// ── Movie Genres & Discover ────────────────────────────────────────
export const getGenres = () =>
  tmdb.get('/genre/movie/list');

export const getMoviesByGenre = (genreId, page = 1) =>
  tmdb.get('/discover/movie', {
    params: { with_genres: genreId, sort_by: 'popularity.desc', page },
  });

// ── People / Actors ───────────────────────────────────────────────
export const getPersonDetails = (id) =>
  tmdb.get(`/person/${id}`);

export const getPersonCredits = (id) =>
  tmdb.get(`/person/${id}/combined_credits`);

// ── Streaming Availability (Watch Providers) ──────────────────────
export const getMovieProviders = (id) =>
  tmdb.get(`/movie/${id}/watch/providers`);

export const getTVProviders = (id) =>
  tmdb.get(`/tv/${id}/watch/providers`);

// ── Helpers ──────────────────────────────────────────────────────────

/** Build full image URL from TMDB path */
export const buildImageUrl = (path, size = POSTER_SIZE) =>
  path ? `${IMAGE_BASE}${size}${path}` : null;

/** Extract YouTube trailer key from a videos response */
export const getTrailerKey = (videos) => {
  if (!videos?.results?.length) return null;
  const trailer =
    videos.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || videos.results.find((v) => v.site === 'YouTube');
  return trailer?.key || null;
};

/**
 * Normalise a TMDB result that could be a movie or TV show into a common shape.
 * - title  → movie.title  || tv.name
 * - year   → release_date || first_air_date
 * - media_type is preserved (or defaulted from the explicit param)
 */
export const normaliseItem = (item, defaultMediaType = 'movie') => ({
  ...item,
  media_type: item.media_type || defaultMediaType,
  title: item.title || item.name || 'Untitled',
  release_date: item.release_date || item.first_air_date || '',
});

export default tmdb;
