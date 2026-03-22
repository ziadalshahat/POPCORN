import { useRef } from 'react';
import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';
import './MovieRow.css';

/**
 * MovieRow — Horizontal scrollable row of movie cards.
 * Netflix-style with left/right scroll arrows.
 */
function MovieRow({ title, movies = [], loading = false, cardCount = 8 }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.offsetWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="movie-row">
      <h2 className="section-title">{title}</h2>

      <div className="movie-row__wrapper">
        {/* Left arrow */}
        <button
          className="movie-row__arrow movie-row__arrow--left"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Scrollable track */}
        <div ref={rowRef} className="movie-row__track">
          {loading
            ? Array.from({ length: cardCount }).map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))
            : movies.slice(0, cardCount).map((movie, i) => (
                <motion.div
                  key={movie.id}
                  className="movie-row__item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))
          }
        </div>

        {/* Right arrow */}
        <button
          className="movie-row__arrow movie-row__arrow--right"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

export default MovieRow;
