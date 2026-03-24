import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getMovieDetails, getMovieVideos, getSimilarMovies, getMovieProviders, buildImageUrl, BACKDROP_SIZE, POSTER_SIZE, getTrailerKey } from '../api/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import MovieRow from '../components/MovieRow';
import SkeletonLoader from '../components/SkeletonLoader';
import ActorCard from '../components/ActorCard';
import './MovieDetailPage.css';

function MovieDetailPage() {
  const { t }    = useTranslation();
  const { id }   = useParams();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const [movie, setMovie]       = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [similar, setSimilar]   = useState([]);
  const [providers, setProviders] = useState([]);
  const [providerLink, setProviderLink] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const castRowRef = useRef(null);

  const scrollCast = (direction) => {
    if (!castRowRef.current) return;
    const el = castRowRef.current;
    const amount = el.offsetWidth * 0.7;
    const isRTL = document.dir === 'rtl';

    // In LTR: prev = -amount, next = +amount
    // In RTL: prev = +amount, next = -amount
    const sign = direction === 'prev' ? -1 : 1;
    const scrollVal = isRTL ? -sign * amount : sign * amount;

    el.scrollBy({ left: scrollVal, behavior: 'smooth' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setError(null);
    setShowTrailer(false);

    Promise.all([
      getMovieDetails(id),
      getMovieVideos(id),
      getSimilarMovies(id),
      getMovieProviders(id),
    ])
      .then(([detailRes, videoRes, similarRes, providersRes]) => {
        setMovie(detailRes.data);
        setTrailerKey(getTrailerKey(videoRes.data));
        setSimilar(similarRes.data.results);
        
        const allProviders = providersRes.data.results || {};
        const cp = allProviders.US || allProviders.GB || Object.values(allProviders)[0];
        const combined = [...(cp?.flatrate || []), ...(cp?.rent || []), ...(cp?.buy || [])];
        const unique = Array.from(new Map(combined.map(p => [p.provider_id, p])).values());
        setProviders(unique);
        setProviderLink(cp?.link || '');
        
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, t]);

  if (loading) return <div className="page-wrapper"><SkeletonLoader type="detail" /></div>;

  if (error || !movie) {
    return (
      <div className="page-wrapper error-state">
        <h3>{t('details.couldNotLoad')}</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>{t('details.goBack')}</button>
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
            <div className="detail-page__no-poster">{t('details.noImage')}</div>
          )}
          {/* Watchlist below poster */}
          <button
            className={`detail-page__watchlist ${inList ? 'active' : ''}`}
            onClick={() => toggleWatchlist(movie)}
          >
            {inList ? t('details.inWatchlist') : t('details.addToWatchlist')}
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
              <h4>{t('details.cast')}</h4>
              <div className="detail-page__cast-wrapper">
                <button
                  className="cast-arrow cast-arrow--prev"
                  onClick={() => scrollCast('prev')}
                  aria-label={t('common.scrollLeft')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="detail-page__cast-list" ref={castRowRef}>
                  {movie.credits.cast.slice(0, 15).map((actor, i) => (
                    <div key={actor.id} className="detail-page__cast-item">
                      <ActorCard actor={actor} delay={i * 0.05} />
                    </div>
                  ))}
                </div>

                <button
                  className="cast-arrow cast-arrow--next"
                  onClick={() => scrollCast('next')}
                  aria-label={t('common.scrollRight')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Where to Watch (Providers) */}
          {providers && providers.length > 0 && (
            <div className="detail-page__providers">
              <h4>{t('details.whereToWatch')}</h4>
              <div className="providers-list">
                {providers.map((p) => (
                  <a
                    key={p.provider_id}
                    className="provider-icon"
                    href={providerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={p.provider_name}
                  >
                    <img src={buildImageUrl(p.logo_path, '/w92')} alt={p.provider_name} />
                  </a>
                ))}
              </div>
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
                {t('details.watchTrailer')}
              </button>
            )}

            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              {t('details.back')}
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
          <MovieRow title={t('details.similarMovies')} movies={similar} />
        </div>
      )}
    </motion.div>
  );
}

export default MovieDetailPage;
