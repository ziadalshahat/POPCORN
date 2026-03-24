import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWatchlist } from '../context/WatchlistContext';
import { buildImageUrl, POSTER_SIZE } from '../api/tmdb';
import './WatchlistPage.css';

function WatchlistPage() {
  const { t } = useTranslation();
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const TABS = [
    { id: 'All', label: t('common.all') },
    { id: 'Movies', label: t('common.movies') },
    { id: 'TV Shows', label: t('common.tvShows') }
  ];

  // Filter based on tab
  const filtered = watchlist.filter((item) => {
    if (activeTab === 'Movies')   return item.media_type !== 'tv';
    if (activeTab === 'TV Shows') return item.media_type === 'tv';
    return true;
  });

  // Counts
  const movieCount = watchlist.filter((i) => i.media_type !== 'tv').length;
  const tvCount    = watchlist.filter((i) => i.media_type === 'tv').length;

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
          {t('watchlist.title')}
        </h1>
        <p>{t('watchlist.savedTitles', { count: watchlist.length })}</p>

        {/* Filter tabs */}
        {watchlist.length > 0 && (
          <div className="watchlist-page__tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`watchlist-page__tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="watchlist-page__tab-count">
                  {tab.id === 'All' ? watchlist.length : tab.id === 'Movies' ? movieCount : tvCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="watchlist-page__content container">
        {watchlist.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <h3>{t('watchlist.title')}</h3>
            <p>{t('watchlist.emptyDetails')}</p>
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate('/')}
            >
              {t('watchlist.browseContent')}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <h3>{t('watchlist.noSavedYet', { tab: TABS.find(t => t.id === activeTab)?.label })}</h3>
            <p>{t('watchlist.addSome', { tab: TABS.find(t => t.id === activeTab)?.label })}</p>
          </div>
        ) : (
          <div className="watchlist-page__grid">
            <AnimatePresence>
              {filtered.map((item, i) => {
                const isTV       = item.media_type === 'tv';
                const title      = item.title || item.name || 'Untitled';
                const year       = (item.release_date || item.first_air_date)?.slice(0, 4);
                const rating     = item.vote_average?.toFixed(1);
                const poster     = buildImageUrl(item.poster_path, POSTER_SIZE);
                const detailPath = isTV ? `/tv/${item.id}` : `/movie/${item.id}`;

                return (
                  <motion.div
                    key={item.id}
                    className="watchlist-card glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: i * 0.04 }}
                    layout
                  >
                    {/* Poster */}
                    <div className="watchlist-card__poster" onClick={() => navigate(detailPath)}>
                      {poster ? (
                        <img src={poster} alt={title} loading="lazy" />
                      ) : (
                        <div className="watchlist-card__no-poster">{t('details.noImage')}</div>
                      )}
                      {isTV && <span className="watchlist-card__type-badge">{t('common.tvLabel')}</span>}
                    </div>

                    {/* Info */}
                    <div className="watchlist-card__info">
                      <h3 className="watchlist-card__title" onClick={() => navigate(detailPath)}>
                        {title}
                      </h3>
                      <p className="watchlist-card__meta">
                        {year && <span>{year}</span>}
                        {rating && <span>⭐ {rating}</span>}
                        {isTV && <span className="watchlist-card__tv-tag">{t('common.tvSeries')}</span>}
                      </p>
                      {item.overview && (
                        <p className="watchlist-card__overview">
                          {item.overview.slice(0, 120)}
                          {item.overview.length > 120 ? '...' : ''}
                        </p>
                      )}

                      <div className="watchlist-card__actions">
                        <button
                          className="btn-primary watchlist-card__watch-btn"
                          onClick={() => navigate(detailPath)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          {t('details.watchTrailer')}
                        </button>
                        <button
                          className="watchlist-card__remove-btn"
                          onClick={() => removeFromWatchlist(item.id)}
                          aria-label={t('details.removeFromWatchlist')}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                          {t('common.remove')}
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
