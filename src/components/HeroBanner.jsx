import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTrendingAll, buildImageUrl, BACKDROP_SIZE, POSTER_SIZE } from '../api/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import './HeroBanner.css';

/**
 * HeroBanner — Auto-rotating cinematic banner.
 * Now fetches /trending/all/day so it features both movies AND TV shows.
 */
function HeroBanner() {
  const { t, i18n } = useTranslation();
  const [items, setItems]     = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    setLoading(true);
    getTrendingAll()
      .then((res) => {
        // Keep only items that have a backdrop (better visual)
        const filtered = res.data.results
          .filter((i) => i.backdrop_path && i.poster_path)
          .slice(0, 6);
        setItems(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [i18n.language]);

  // Auto-rotate every 7 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const timer = setTimeout(() => {
      setCurrent((c) => (c + 1) % items.length);
    }, 7000);
    return () => clearTimeout(timer);
  }, [current, items]);

  if (loading) return <div className="hero-skeleton shimmer" />;
  if (!items.length) return null;

  const item       = items[current];
  const mediaType  = item.media_type || 'movie';
  const title      = item.title || item.name || 'Untitled';
  const dateStr    = item.release_date || item.first_air_date || '';
  const year       = dateStr.slice(0, 4);
  const rating     = item.vote_average?.toFixed(1);
  const backdrop   = buildImageUrl(item.backdrop_path, BACKDROP_SIZE);
  const detailPath = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;

  return (
    <section className="hero">
      {/* Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
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
            key={item.id + '-content'}
            className="hero__info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="hero__meta">
              <span className="hero__trending-badge">
                {mediaType === 'tv' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm0 14H3V5h18v12z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 2c0 0-4.5 5.5-4.5 9 0 2.49 2.01 4.5 4.5 4.5s4.5-2.01 4.5-4.5c0-1.5-.5-3-1.5-4.5" />
                    <path d="M13.5 2C16 5.5 17 8 17 11.5c0 2.49-2.01 4.5-4.5 4.5C10.01 16 8 13.99 8 11.5c0-3.5 5.5-9.5 5.5-9.5z" />
                  </svg>
                )}
                {mediaType === 'tv' ? t('home.trendingTV') : t('home.trendingMovies')}
              </span>
              <span className="hero__year">{year}</span>
              <span className="hero__rating">⭐ {rating}</span>
              {mediaType === 'tv' && <span className="hero__type-pill">{t('common.tvSeries')}</span>}
            </div>

            <h1 className="hero__title">{title}</h1>
            <p className="hero__overview">
              {item.overview?.slice(0, 200)}{item.overview?.length > 200 ? '...' : ''}
            </p>

            <div className="hero__actions">
              <button
                className="btn-primary hero__play-btn"
                onClick={() => navigate(detailPath)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {mediaType === 'tv' ? t('details.viewShow') : t('details.watchTrailer')}
              </button>

              <button
                className={`btn-secondary hero__watchlist-btn ${isInWatchlist(item.id) ? 'active' : ''}`}
                onClick={() => toggleWatchlist({ ...item, media_type: mediaType })}
              >
                {isInWatchlist(item.id) ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    {t('details.inWatchlist')}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    {t('details.addToWatchlist')}
                  </>
                )}
              </button>

              <button
                className="btn-secondary hero__info-btn"
                onClick={() => navigate(detailPath)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                {t('details.moreInfo')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Thumbnail strip */}
        <div className="hero__thumbnails">
          {items.map((m, i) => (
            <button
              key={m.id}
              className={`hero__thumb ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            >
              <img
                src={buildImageUrl(m.poster_path, POSTER_SIZE)}
                alt={m.title || m.name}
                loading="lazy"
              />
              {i === current && <div className="hero__thumb-active-bar" />}
            </button>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="hero__dots">
        {items.map((m, i) => (
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
