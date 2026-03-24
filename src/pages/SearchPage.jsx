import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { searchMulti } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import ActorCard from '../components/ActorCard';
import SkeletonLoader from '../components/SkeletonLoader';
import './SearchPage.css';

/**
 * SearchPage — searches movies, TV shows, and actors using TMDB /search/multi.
 * Filter tabs: All | Movies | TV Shows | People
 */
function SearchPage() {
  const { t }          = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [activeTab, setActiveTab]   = useState('All');
  const debounceRef                 = useRef(null);

  const TABS = [
    { id: 'All', label: t('common.all') },
    { id: 'Movies', label: t('common.movies') },
    { id: 'TV Shows', label: t('common.tvShows') },
    { id: 'People', label: t('common.people') }
  ];

  // Handle URL param ?q= from navbar
  useEffect(() => {
    const urlQ = searchParams.get('q');
    if (urlQ) {
      setQuery(urlQ);
      performSearch(urlQ);
    }
  }, []); // eslint-disable-line

  // Debounced live search as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setSearched(false); return; }

    debounceRef.current = setTimeout(() => performSearch(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]); // eslint-disable-line

  const performSearch = async (q) => {
    setLoading(true);
    try {
      const res = await searchMulti(q);
      // Keep movies, tv and people
      const resList = res.data.results || [];
      setResults(resList);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    performSearch(query.trim());
  };

  // Apply tab filter
  const displayResults = results.filter((item) => {
    if (activeTab === 'Movies')   return item.media_type === 'movie';
    if (activeTab === 'TV Shows') return item.media_type === 'tv';
    if (activeTab === 'People')   return item.media_type === 'person';
    return true;
  });

  const movieCount = results.filter((r) => r.media_type === 'movie').length;
  const tvCount    = results.filter((r) => r.media_type === 'tv').length;
  const personCount = results.filter((r) => r.media_type === 'person').length;

  return (
    <motion.div
      className="search-page page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="search-page__header container">
        <h1>{t('search.title')}</h1>
        <form className="search-page__form" onSubmit={handleSubmit}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('nav.searchPlaceholder')}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveTab('All'); }}
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); setSearched(false); }}>✕</button>
          )}
          <button type="submit" className="search-page__btn">{t('search.title')}</button>
        </form>

        {/* Result count */}
        {searched && results.length > 0 && (
          <p className="search-page__count">
            {t('search.foundResults', { count: results.length, query })}
          </p>
        )}

        {/* Filter tabs */}
        {searched && results.length > 0 && (
          <div className="search-page__tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`search-page__tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="search-page__tab-count">
                  {tab.id === 'All' ? results.length : tab.id === 'Movies' ? movieCount : tab.id === 'TV Shows' ? tvCount : personCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="search-page__results container">
        {loading && (
          <div className="search-page__grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonLoader key={i} type={activeTab === 'People' ? 'person' : 'card'} />
            ))}
          </div>
        )}

        {!loading && displayResults.length > 0 && (
          <div className="search-page__grid">
            {displayResults.map((item, i) => (
              <motion.div
                key={`${item.media_type}-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {item.media_type === 'person' ? (
                  <ActorCard actor={item} />
                ) : (
                  <MovieCard item={item} mediaType={item.media_type} />
                )}
              </motion.div>
            ))}
          </div>
        )}

        {!loading && query.trim() && searched && displayResults.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>{t('search.noResultsFound', { tab: TABS.find(t => t.id === activeTab)?.label })}</h3>
            <p>{t('search.tryDifferent')}</p>
          </div>
        )}

        {!loading && !query.trim() && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>{t('search.whatAreYouLookingFor')}</h3>
            <p>{t('search.typeToSearch')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default SearchPage;
