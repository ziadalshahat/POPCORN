import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchMovies } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonLoader from '../components/SkeletonLoader';
import useSearch from '../hooks/useSearch';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pageResults, setPageResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { query, setQuery, results, loading: liveLoading, clearSearch } = useSearch();

  // Handle URL param ?q= from navbar
  useEffect(() => {
    const urlQ = searchParams.get('q');
    if (urlQ) {
      setQuery(urlQ);
      setLoading(true);
      searchMovies(urlQ)
        .then((r) => { setPageResults(r.data.results); setSearched(true); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, []); // eslint-disable-line

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await searchMovies(query);
      setPageResults(res.data.results);
      setSearched(true);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const displayResults = searched ? pageResults : results;
  const isLoading      = searched ? loading : liveLoading;

  return (
    <motion.div
      className="search-page page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="search-page__header container">
        <h1>Search Movies</h1>
        <form className="search-page__form" onSubmit={handleSearch}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search for a movie..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
            autoFocus
          />
          {query && (
            <button type="button" onClick={() => { clearSearch(); setPageResults([]); setSearched(false); }}>✕</button>
          )}
          <button type="submit" className="search-page__btn">
            Search
          </button>
        </form>
        {searched && pageResults.length > 0 && (
          <p className="search-page__count">
            Found <strong>{pageResults.length}</strong> results for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <div className="search-page__results container">
        {isLoading && (
          <div className="search-page__grid">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonLoader key={i} type="card" />)}
          </div>
        )}

        {!isLoading && displayResults.length > 0 && (
          <div className="search-page__grid">
            {displayResults.map((movie, i) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && query.trim() && displayResults.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>No results found</h3>
            <p>Try a different movie title or check your spelling.</p>
          </div>
        )}

        {!isLoading && !query.trim() && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <h3>What are you looking for?</h3>
            <p>Type a movie name to start searching.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default SearchPage;
