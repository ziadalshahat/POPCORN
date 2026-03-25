import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getWatchlist, addToWatchlistAPI, removeFromWatchlistAPI } from '../api/auth';

const WatchlistContext = createContext(null);
const STORAGE_KEY = 'popcorn_watchlist';

export function WatchlistProvider({ children }) {
  const { user } = useAuth();

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // When user logs in, fetch watchlist from backend
  // When user logs out, clear watchlist
  useEffect(() => {
    if (user) {
      getWatchlist()
        .then((res) => {
          setWatchlist(res.data);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        })
        .catch(() => {
          // If fetch fails, use localStorage fallback
        });
    } else {
      setWatchlist([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  /** Add a movie object to the watchlist */
  const addToWatchlist = useCallback(async (movie) => {
    // Optimistic update
    setWatchlist((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });

    if (user) {
      try {
        const res = await addToWatchlistAPI({
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          media_type: movie.media_type || 'movie',
        });
        setWatchlist(res.data);
      } catch {
        // Revert on failure
        setWatchlist((prev) => prev.filter((m) => m.id !== movie.id));
      }
    }
  }, [user]);

  /** Remove a movie by id from the watchlist */
  const removeFromWatchlist = useCallback(async (id) => {
    const backup = watchlist;
    // Optimistic update
    setWatchlist((prev) => prev.filter((m) => m.id !== id));

    if (user) {
      try {
        const res = await removeFromWatchlistAPI(id);
        setWatchlist(res.data);
      } catch {
        // Revert on failure
        setWatchlist(backup);
      }
    }
  }, [user, watchlist]);

  /** Toggle add/remove */
  const toggleWatchlist = useCallback((movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  }, [addToWatchlist, removeFromWatchlist]);

  /** Check if a movie is in the watchlist */
  const isInWatchlist = useCallback((id) => watchlist.some((m) => m.id === id), [watchlist]);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
};

export default WatchlistContext;
