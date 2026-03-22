import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import useSearch from '../hooks/useSearch';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef                = useRef(null);
  const profileRef                    = useRef(null);
  const navigate                      = useNavigate();
  const location                      = useLocation();
  const { user, logout }              = useAuth();
  const { watchlist }                 = useWatchlist();
  const { query, setQuery, results, loading, clearSearch } = useSearch();

  // Darken navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
    else clearSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      clearSearch();
    }
  };

  const handleResultClick = (id) => {
    navigate(`/movie/${id}`);
    setSearchOpen(false);
    clearSearch();
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Logo */}
      <Link to="/" className="navbar__logo">
        POP<span>CORN</span>
      </Link>

      {/* Desktop nav links */}
      <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/genres" className={location.pathname === '/genres' ? 'active' : ''}>Browse</Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>Movies</Link>
      </nav>

      {/* Right side actions */}
      <div className="navbar__actions">
        {/* Search */}
        <button
          className="navbar__icon-btn"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Toggle search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
        </button>

        {/* Watchlist */}
        <Link to="/watchlist" className="navbar__icon-btn navbar__watchlist-btn" aria-label="Watchlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {watchlist.length > 0 && (
            <span className="navbar__badge">{watchlist.length}</span>
          )}
        </Link>

        {/* Auth */}
        {user ? (
          <div className="navbar__profile" ref={profileRef}>
            <button
              className="navbar__avatar"
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Profile menu"
            >
              <img src={user.avatar} alt={user.name} />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="navbar__dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="navbar__dropdown-user">
                    <img src={user.avatar} alt={user.name} />
                    <div>
                      <p className="name">{user.name}</p>
                      <p className="email">{user.email}</p>
                    </div>
                  </div>
                  <hr />
                  <Link to="/watchlist" onClick={() => setProfileOpen(false)}>
                    My Watchlist
                  </Link>
                  <button className="logout" onClick={() => { logout(); setProfileOpen(false); }}>
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/auth" className="navbar__signin-btn">Sign In</Link>
        )}

        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="navbar__search-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <form onSubmit={handleSearchSubmit} className="navbar__search-form">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, genres, actors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button type="button" className="navbar__search-clear" onClick={clearSearch} aria-label="Clear">
                  ✕
                </button>
              )}
              <button type="button" className="navbar__search-close" onClick={() => setSearchOpen(false)}>
                Close
              </button>
            </form>

            {/* Live results dropdown */}
            {query.trim() && (
              <div className="navbar__search-results">
                {loading && (
                  <div className="navbar__search-loading">
                    <div className="spinner" />
                    <span>Searching...</span>
                  </div>
                )}
                {!loading && results.length === 0 && (
                  <p className="navbar__search-empty">No results for &ldquo;{query}&rdquo;</p>
                )}
                {results.slice(0, 6).map((movie) => (
                  <button
                    key={movie.id}
                    className="navbar__search-item"
                    onClick={() => handleResultClick(movie.id)}
                  >
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                        alt={movie.title}
                      />
                    ) : (
                      <div className="navbar__search-item-placeholder" />
                    )}
                    <div>
                      <p className="title">{movie.title}</p>
                      <p className="year">{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average?.toFixed(1)}</p>
                    </div>
                  </button>
                ))}
                {results.length > 6 && (
                  <button
                    className="navbar__search-more"
                    onClick={handleSearchSubmit}
                  >
                    See all {results.length} results →
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
