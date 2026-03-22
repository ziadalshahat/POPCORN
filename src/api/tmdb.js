import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

export const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;
export const BACKDROP_SIZE = '/original';
export const POSTER_SIZE = '/w500';
export const THUMB_SIZE = '/w185';

// Axios instance
const tmdb = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY, language: 'en-US' },
});

// ── Movie Lists ──────────────────────────────────────────────
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

// ── Movie Details ─────────────────────────────────────────────
export const getMovieDetails = (id) =>
  tmdb.get(`/movie/${id}`, { params: { append_to_response: 'credits' } });

export const getMovieVideos = (id) =>
  tmdb.get(`/movie/${id}/videos`);

export const getSimilarMovies = (id, page = 1) =>
  tmdb.get(`/movie/${id}/similar`, { params: { page } });

// ── Search ─────────────────────────────────────────────────────
export const searchMovies = (query, page = 1) =>
  tmdb.get('/search/movie', { params: { query, page } });

// ── Genres ─────────────────────────────────────────────────────
export const getGenres = () =>
  tmdb.get('/genre/movie/list');

export const getMoviesByGenre = (genreId, page = 1) =>
  tmdb.get('/discover/movie', {
    params: { with_genres: genreId, sort_by: 'popularity.desc', page },
  });

// ── Helpers ─────────────────────────────────────────────────────

/** Build full image URL from TMDB path */
export const buildImageUrl = (path, size = POSTER_SIZE) =>
  path ? `${IMAGE_BASE}${size}${path}` : null;

/** Extract YouTube trailer key from videos response */
export const getTrailerKey = (videos) => {
  if (!videos?.results?.length) return null;
  const trailer =
    videos.results.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || videos.results.find((v) => v.site === 'YouTube');
  return trailer?.key || null;
};

export default tmdb;
