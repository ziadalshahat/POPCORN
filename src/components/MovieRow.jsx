import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';
import './MovieRow.css';

/**
 * MovieRow — Horizontal scrollable row of movie/TV cards.
 */
function MovieRow({ title, movies = [], loading = false, mediaType = 'movie', cardCount = 8 }) {
  const { t } = useTranslation();
  const rowRef = useRef(null);

  const scroll = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.offsetWidth * 0.75;
    const isRTL = document.dir === 'rtl';

    const sign = direction === 'prev' ? -1 : 1;
    const scrollVal = isRTL ? -sign * amount : sign * amount;

    el.scrollBy({ left: scrollVal, behavior: 'smooth' });
  };

  return (
    <section className="movie-row">
      <h2 className="section-title">{title}</h2>

      <div className="movie-row__wrapper">
        {/* Left arrow */}
        <button
          className="movie-row__arrow movie-row__arrow--prev"
          onClick={() => scroll('prev')}
          aria-label={t('common.scrollLeft')}
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
            : movies.slice(0, cardCount).map((item, i) => (
                <motion.div
                  key={item.id}
                  className="movie-row__item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                >
                  <MovieCard item={item} mediaType={mediaType} />
                </motion.div>
              ))
          }
        </div>

        {/* Right arrow */}
        <button
          className="movie-row__arrow movie-row__arrow--next"
          onClick={() => scroll('next')}
          aria-label={t('common.scrollRight')}
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
