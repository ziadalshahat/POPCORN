import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import { buildImageUrl, POSTER_SIZE } from '../api/tmdb';
import './WatchlistPage.css';

function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();

  return (
    <motion.div
      className="watchlist-page page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="watchlist-page__header container">
        <h1>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          My Watchlist
        </h1>
        <p>{watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved</p>
      </div>

      <div className="watchlist-page__content container">
        {watchlist.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <h3>Your watchlist is empty</h3>
            <p>Browse movies and click the bookmark icon to save them here.</p>
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/')}
            >
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="watchlist-page__grid">
            <AnimatePresence>
              {watchlist.map((movie, i) => {
                const poster = buildImageUrl(movie.poster_path, POSTER_SIZE);
                const year   = movie.release_date?.slice(0, 4);
                const rating = movie.vote_average?.toFixed(1);

                return (
                  <motion.div
                    key={movie.id}
                    className="watchlist-card glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.04 }}
                    layout
                  >
                    {/* Poster */}
                    <div
                      className="watchlist-card__poster"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      {poster ? (
                        <img src={poster} alt={movie.title} loading="lazy" />
                      ) : (
                        <div className="watchlist-card__no-poster">No Image</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="watchlist-card__info">
                      <h3
                        className="watchlist-card__title"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        {movie.title}
                      </h3>
                      <p className="watchlist-card__meta">
                        {year && <span>{year}</span>}
                        {rating && <span>⭐ {rating}</span>}
                      </p>
                      {movie.overview && (
                        <p className="watchlist-card__overview">
                          {movie.overview.slice(0, 120)}
                          {movie.overview.length > 120 ? '...' : ''}
                        </p>
                      )}

                      <div className="watchlist-card__actions">
                        <button
                          className="btn-primary watchlist-card__watch-btn"
                          onClick={() => navigate(`/movie/${movie.id}`)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Watch
                        </button>
                        <button
                          className="watchlist-card__remove-btn"
                          onClick={() => removeFromWatchlist(movie.id)}
                          aria-label="Remove from watchlist"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default WatchlistPage;
