import { useState, useEffect, useRef } from 'react';
import { searchMovies } from '../api/tmdb';

/**
 * Debounced live search hook.
 * Fires a TMDB search request 400ms after the user stops typing.
 */
function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchMovies(query);
        setResults(res.data.results || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return { query, setQuery, results, loading, error, clearSearch };
}

export default useSearch;
