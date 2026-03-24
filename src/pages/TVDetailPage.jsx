import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  getTVDetails, getTVVideos, getTVSeason, getSimilarTV, getTVProviders,
  buildImageUrl, BACKDROP_SIZE, POSTER_SIZE, getTrailerKey,
} from '../api/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import MovieRow from '../components/MovieRow';
import EpisodeCard from '../components/EpisodeCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ActorCard from '../components/ActorCard';
import './TVDetailPage.css';

/**
 * TVDetailPage — Full detail view for a TV show.
 * Shows: backdrop, poster, info, genre badges, seasons dropdown, episodes, trailer modal.
 */
function TVDetailPage() {
  const { t }    = useTranslation();
  const { id }   = useParams();
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  const [show, setShow]             = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [similar, setSimilar]       = useState([]);
  const [providers, setProviders]   = useState([]);
  const [providerLink, setProviderLink] = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  // Season / episode state
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes]             = useState([]);
  const [loadingEps, setLoadingEps]         = useState(false);

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

  // ── Fetch show data ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setError(null);
    setShowTrailer(false);
    setEpisodes([]);

    Promise.all([
      getTVDetails(id),
      getTVVideos(id),
      getSimilarTV(id),
      getTVProviders(id),
    ])
      .then(([detailRes, videoRes, similarRes, providersRes]) => {
        const tvData = detailRes.data;
        setShow(tvData);
        setTrailerKey(getTrailerKey(videoRes.data));
        setSimilar(similarRes.data.results);
        
        const allProviders = providersRes.data.results || {};
        const cp = allProviders.US || allProviders.GB || Object.values(allProviders)[0];
        const combined = [...(cp?.flatrate || []), ...(cp?.rent || []), ...(cp?.buy || [])];
        const unique = Array.from(new Map(combined.map(p => [p.provider_id, p])).values());
        setProviders(unique);
        setProviderLink(cp?.link || '');
        
        // Default to season 1 (or first available)
        const firstSeason = tvData.seasons?.find((s) => s.season_number > 0)?.season_number || 1;
        setSelectedSeason(firstSeason);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, t]);

  // ── Fetch episodes when season changes ───────────────────────
  useEffect(() => {
    if (!show || !selectedSeason) return;
    setLoadingEps(true);
    setEpisodes([]);
    getTVSeason(id, selectedSeason)
      .then((res) => {
        setEpisodes(res.data.episodes || []);
        setLoadingEps(false);
      })
      .catch(() => setLoadingEps(false));
  }, [id, selectedSeason, show, t]);

  // ── Loading / Error states ───────────────────────────────────
  if (loading) return <div className="page-wrapper"><SkeletonLoader type="detail" /></div>;

  if (error || !show) {
    return (
      <div className="page-wrapper error-state">
        <h3>{t('details.couldNotLoad')}</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>{t('details.goBack')}</button>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────
  const backdrop   = buildImageUrl(show.backdrop_path, BACKDROP_SIZE);
  const poster     = buildImageUrl(show.poster_path, POSTER_SIZE);
  const rating     = show.vote_average?.toFixed(1);
  const firstAir   = show.first_air_date?.slice(0, 4);
  const inList     = isInWatchlist(show.id);
  const seasons    = show.seasons?.filter((s) => s.season_number > 0) || [];
  const totalEps   = show.number_of_episodes;
  const selectedSeasonData = seasons.find((s) => s.season_number === selectedSeason);

  return (
    <motion.div
      className="tv-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Backdrop */}
      <div
        className="tv-detail__backdrop"
        style={{ backgroundImage: `url(${backdrop})` }}
      >
        <div className="tv-detail__backdrop-overlay" />
      </div>

      {/* Main content */}
      <div className="tv-detail__body container">
        {/* Poster */}
        <motion.div
          className="tv-detail__poster"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {poster ? (
            <img src={poster} alt={show.name} />
          ) : (
            <div className="tv-detail__no-poster">{t('details.noImage')}</div>
          )}
          <button
            className={`tv-detail__watchlist ${inList ? 'active' : ''}`}
            onClick={() => toggleWatchlist({ ...show, media_type: 'tv' })}
          >
            {inList ? t('details.inWatchlist') : t('details.addToWatchlist')}
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          className="tv-detail__info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          {/* Genres */}
          <div className="tv-detail__meta">
            <span className="tv-detail__type-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm0 14H3V5h18v12z" />
              </svg>
              {t('common.tvShows')}
            </span>
            {show.genres?.slice(0, 3).map((g) => (
              <span key={g.id} className="genre-badge">{g.name}</span>
            ))}
          </div>

          <h1 className="tv-detail__title">{show.name}</h1>

          {show.tagline && (
            <p className="tv-detail__tagline">"{show.tagline}"</p>
          )}

          {/* Stats row */}
          <div className="tv-detail__stats">
            <span>⭐ <strong>{rating}</strong>/10</span>
            <span>📅 {firstAir}</span>
            <span>📺 {show.number_of_seasons} {t('details.seasons')}</span>
            <span>🎬 {totalEps} {t('details.episodes')}</span>
            {show.status && <span className={`tv-detail__status ${show.status === 'Returning Series' ? 'ongoing' : ''}`}>{show.status}</span>}
          </div>

          <p className="tv-detail__overview">{show.overview}</p>

          {/* Cast */}
          {show.credits?.cast?.length > 0 && (
            <div className="tv-detail__cast">
              <h4>{t('details.cast')}</h4>
              <div className="tv-detail__cast-wrapper">
                <button
                  className="cast-arrow cast-arrow--prev"
                  onClick={() => scrollCast('prev')}
                  aria-label={t('common.scrollLeft')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="tv-detail__cast-list" ref={castRowRef}>
                  {show.credits.cast.slice(0, 15).map((actor, i) => (
                    <div key={actor.id} className="tv-detail__cast-item">
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
            <div className="tv-detail__providers">
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

          {/* Action buttons */}
          <div className="tv-detail__actions">
            {trailerKey && (
              <button className="btn-primary" onClick={() => setShowTrailer(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t('details.watchTrailer')}
              </button>
            )}
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              {t('details.back')}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Seasons & Episodes */}
      {seasons.length > 0 && (
        <div className="tv-detail__seasons container">
          <div className="tv-detail__seasons-header">
            <h2 className="section-title">{t('details.episodes')}</h2>

            {/* Season selector */}
            <div className="tv-detail__season-selector">
              <label htmlFor="season-select" className="tv-detail__season-label">{t('details.season')}</label>
              <select
                id="season-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="tv-detail__season-select"
              >
                {seasons.map((s) => (
                  <option key={s.season_number} value={s.season_number}>
                     {t('details.season')} {s.season_number}
                    {s.episode_count ? ` (${s.episode_count} eps)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedSeasonData && (
            <p className="tv-detail__season-desc">
              {selectedSeasonData.overview}
            </p>
          )}

          {/* Episodes grid */}
          <div className="tv-detail__episodes">
            {loadingEps ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="episode-skeleton shimmer" />
              ))
            ) : episodes.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSeason}
                  className="tv-detail__episodes-list"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {episodes.map((ep) => (
                    <EpisodeCard key={ep.id || ep.episode_number} episode={ep} />
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <p className="tv-detail__no-eps">{t('details.couldNotLoad')}</p>
            )}
          </div>
        </div>
      )}

      {/* Trailer modal */}
      {showTrailer && trailerKey && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button className="trailer-modal__close" onClick={() => setShowTrailer(false)}>✕</button>
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

      {/* Similar shows */}
      {similar.length > 0 && (
        <div className="tv-detail__similar">
          <MovieRow title={t('details.similarShows')} movies={similar} mediaType="tv" />
        </div>
      )}
    </motion.div>
  );
}

export default TVDetailPage;
