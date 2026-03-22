import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMovieDetails, getMovieVideos, getSimilarMovies, buildImageUrl, BACKDROP_SIZE, POSTER_SIZE, getTrailerKey } from '../api/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import MovieRow from '../components/MovieRow';
import SkeletonLoader from '../components/SkeletonLoader';
import './MovieDetailPage.css';

function MovieDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const [movie, setMovie]       = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [similar, setSimilar]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setError(null);
    setShowTrailer(false);

    Promise.all([
      getMovieDetails(id),
      getMovieVideos(id),
      getSimilarMovies(id),
    ])
      .then(([detailRes, videoRes, similarRes]) => {
        setMovie(detailRes.data);
        setTrailerKey(getTrailerKey(videoRes.data));
        setSimilar(similarRes.data.results);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="page-wrapper"><SkeletonLoader type="detail" /></div>;

  if (error || !movie) {
    return (
      <div className="page-wrapper error-state">
        <h3>Could not load movie</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const backdrop = buildImageUrl(movie.backdrop_path, BACKDROP_SIZE);
  const poster   = buildImageUrl(movie.poster_path, POSTER_SIZE);
  const rating   = movie.vote_average?.toFixed(1);
  const year     = movie.release_date?.slice(0, 4);
  const runtime  = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const inList   = isInWatchlist(movie.id);

  return (
    <motion.div
      className="detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <div
        className="detail-page__backdrop"
        style={{ backgroundImage: `url(${backdrop})` }}
      >
        <div className="detail-page__backdrop-overlay" />
      </div>

      {/* Main content */}
      <div className="detail-page__body container">
        {/* Poster */}
        <motion.div
          className="detail-page__poster"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {poster ? (
            <img src={poster} alt={movie.title} />
          ) : (
            <div className="detail-page__no-poster">No Image</div>
          )}
          {/* Watchlist below poster */}
          <button
            className={`detail-page__watchlist ${inList ? 'active' : ''}`}
            onClick={() => toggleWatchlist(movie)}
          >
            {inList ? '✓ In Watchlist' : '+ Add to Watchlist'}
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          className="detail-page__info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="detail-page__meta">
            {movie.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="genre-badge">{g.name}</span>
            ))}
          </div>

          <h1 className="detail-page__title">{movie.title}</h1>

          {movie.tagline && (
            <p className="detail-page__tagline">"{movie.tagline}"</p>
          )}

          <div className="detail-page__stats">
            <span>⭐ <strong>{rating}</strong>/10</span>
            <span>📅 {year}</span>
            <span>⏱ {runtime}</span>
            {movie.original_language && (
              <span>🌐 {movie.original_language.toUpperCase()}</span>
            )}
          </div>

          <p className="detail-page__overview">{movie.overview}</p>

          {/* Cast */}
          {movie.credits?.cast?.length > 0 && (
            <div className="detail-page__cast">
              <h4>Cast</h4>
              <p>
                {movie.credits.cast
                  .slice(0, 5)
                  .map((a) => a.name)
                  .join(' · ')}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="detail-page__actions">
            {trailerKey && (
              <button
                className="btn-primary"
                onClick={() => setShowTrailer(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Trailer
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </div>

      {/* Trailer modal */}
      {showTrailer && trailerKey && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="trailer-modal__close"
              onClick={() => setShowTrailer(false)}
            >✕</button>
            <div className="trailer-modal__player">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                title="Trailer"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Similar movies */}
      {similar.length > 0 && (
        <div className="detail-page__similar">
          <MovieRow title="You May Also Like" movies={similar} />
        </div>
      )}
    </motion.div>
  );
}

export default MovieDetailPage;
