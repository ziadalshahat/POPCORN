import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrending, buildImageUrl, BACKDROP_SIZE, POSTER_SIZE } from '../api/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import './HeroBanner.css';

function HeroBanner() {
  const [movies, setMovies]     = useState([]);
  const [current, setCurrent]   = useState(0);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    getTrending()
      .then((res) => {
        setMovies(res.data.results.slice(0, 6));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (movies.length === 0) return;
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % movies.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [current, movies]);

  if (loading) {
    return <div className="hero-skeleton shimmer" />;
  }

  if (!movies.length) return null;

  const movie = movies[current];
  const backdrop = buildImageUrl(movie.backdrop_path, BACKDROP_SIZE);
  const poster   = buildImageUrl(movie.poster_path, POSTER_SIZE);
  const rating   = movie.vote_average?.toFixed(1);
  const year     = movie.release_date?.slice(0, 4);

  return (
    <section className="hero">
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          className="hero__backdrop"
          style={{ backgroundImage: `url(${backdrop})` }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="hero__overlay" />

      {/* Content */}
      <div className="hero__content container">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id + '-content'}
            className="hero__info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="hero__meta">
              <span className="hero__trending-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 2c0 0-4.5 5.5-4.5 9 0 2.49 2.01 4.5 4.5 4.5s4.5-2.01 4.5-4.5c0-1.5-.5-3-1.5-4.5" />
                  <path d="M13.5 2C16 5.5 17 8 17 11.5c0 2.49-2.01 4.5-4.5 4.5C10.01 16 8 13.99 8 11.5c0-3.5 5.5-9.5 5.5-9.5z" />
                </svg>
                Trending #{current + 1}
              </span>
              <span className="hero__year">{year}</span>
              <span className="hero__rating">⭐ {rating}</span>
            </div>

            <h1 className="hero__title">{movie.title}</h1>
            <p className="hero__overview">{movie.overview?.slice(0, 200)}{movie.overview?.length > 200 ? '...' : ''}</p>

            <div className="hero__actions">
              <button
                className="btn-primary hero__play-btn"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              <button
                className={`btn-secondary hero__watchlist-btn ${isInWatchlist(movie.id) ? 'active' : ''}`}
                onClick={() => toggleWatchlist(movie)}
              >
                {isInWatchlist(movie.id) ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    Saved
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    My List
                  </>
                )}
              </button>

              <button
                className="btn-secondary hero__info-btn"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                More Info
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnail strip */}
        <div className="hero__thumbnails">
          {movies.map((m, i) => (
            <button
              key={m.id}
              className={`hero__thumb ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            >
              <img
                src={buildImageUrl(m.poster_path, POSTER_SIZE)}
                alt={m.title}
                loading="lazy"
              />
              {i === current && <div className="hero__thumb-active-bar" />}
            </button>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="hero__dots">
        {movies.map((m, i) => (
          <button
            key={m.id}
            className={`hero__dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;
