import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MovieRow from '../components/MovieRow';
import HeroBanner from '../components/HeroBanner';
import { getTrendingTV, getPopularTV, getTopRatedTV, getOnAirTV } from '../api/tmdb';
import './TVShowsPage.css';

/**
 * TVShowsPage — Dedicated page for TV shows.
 * Shows trending, popular, top-rated, and on-air rows (all TV, mediaType="tv").
 */
function TVShowsPage() {
  const { t, i18n } = useTranslation();
  const [trending, setTrending]   = useState([]);
  const [popular, setPopular]     = useState([]);
  const [topRated, setTopRated]   = useState([]);
  const [onAir, setOnAir]         = useState([]);
  const [loadingT, setLT]         = useState(true);
  const [loadingP, setLP]         = useState(true);
  const [loadingTR, setLTR]       = useState(true);
  const [loadingOA, setLOA]       = useState(true);

  useEffect(() => {
    setLT(true); setLP(true); setLTR(true); setLOA(true);
    getTrendingTV()
      .then((r) => { setTrending(r.data.results); setLT(false); })
      .catch(() => setLT(false));
    getPopularTV()
      .then((r) => { setPopular(r.data.results); setLP(false); })
      .catch(() => setLP(false));
    getTopRatedTV()
      .then((r) => { setTopRated(r.data.results); setLTR(false); })
      .catch(() => setLTR(false));
    getOnAirTV()
      .then((r) => { setOnAir(r.data.results); setLOA(false); })
      .catch(() => setLOA(false));
  }, [i18n.language]);

  return (
    <motion.main
      className="tv-shows-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className="tv-shows-page__header container">
        <div className="tv-shows-page__header-content">
          <span className="tv-shows-page__eyebrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2zm0 14H3V5h18v12z" />
            </svg>
            {t('common.tvShows')}
          </span>
          <h1 className="tv-shows-page__title">{t('watchlist.exploreTV')}</h1>
          <p className="tv-shows-page__subtitle">
            {t('watchlist.tvSubtitle')}
          </p>
        </div>
      </div>

      {/* Rows */}
      <div className="tv-shows-page__rows">
        <MovieRow
          title={t('watchlist.trendingTVToday')}
          movies={trending}
          loading={loadingT}
          mediaType="tv"
        />
        <MovieRow
          title={t('watchlist.nowOnAir')}
          movies={onAir}
          loading={loadingOA}
          mediaType="tv"
        />
        <MovieRow
          title={t('watchlist.popularTVShows')}
          movies={popular}
          loading={loadingP}
          mediaType="tv"
        />
        <MovieRow
          title={t('watchlist.topRatedTVShows')}
          movies={topRated}
          loading={loadingTR}
          mediaType="tv"
        />
      </div>
    </motion.main>
  );
}

export default TVShowsPage;
