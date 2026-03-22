import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { buildImageUrl, POSTER_SIZE } from '../api/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import './MovieCard.css';

/**
 * MovieCard — Netflix-style card with hover overlay
 * Shows poster, on hover reveals title, rating, overview snippet,
 * play button, and watchlist toggle.
 */
function MovieCard({ movie }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate  = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  if (!movie) return null;

  const poster  = buildImageUrl(movie.poster_path, POSTER_SIZE);
  const rating  = movie.vote_average?.toFixed(1);
  const year    = movie.release_date?.slice(0, 4);
  const inList  = isInWatchlist(movie.id);

  const ratingClass =
    movie.vote_average >= 7 ? 'rating-high' :
    movie.vote_average >= 5 ? 'rating-medium' : 'rating-low';

  return (
    <motion.div
      className="movie-card"
      whileHover={{ scale: 1.04, zIndex: 10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Poster */}
      <div className="movie-card__poster" onClick={() => navigate(`/movie/${movie.id}`)}>
        {!imgLoaded && <div className="movie-card__skeleton shimmer" />}
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{ opacity: imgLoaded ? 1 : 0 }}
          />
        ) : (
          <div className="movie-card__no-image">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Rating badge */}
        <div className={`movie-card__rating ${ratingClass}`}>
          ⭐ {rating}
        </div>

        {/* Hover overlay */}
        <div className="movie-card__overlay">
          <h3 className="movie-card__title">{movie.title}</h3>
          <p className="movie-card__year">{year}</p>
          <p className="movie-card__overview">
            {movie.overview?.slice(0, 100)}{movie.overview?.length > 100 ? '...' : ''}
          </p>
          <div className="movie-card__overlay-actions">
            <button
              className="movie-card__play-btn"
              onClick={(e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`); }}
              aria-label="Watch"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <button
              className={`movie-card__watchlist-btn ${inList ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie); }}
              aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {inList ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card footer */}
      <div className="movie-card__footer">
        <p className="movie-card__name">{movie.title}</p>
        <p className="movie-card__meta">{year} · <span className={ratingClass}>⭐ {rating}</span></p>
      </div>
    </motion.div>
  );
}

export default MovieCard;
