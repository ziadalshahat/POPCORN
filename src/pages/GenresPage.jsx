import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getGenres, getMoviesByGenre } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonLoader from '../components/SkeletonLoader';
import './GenresPage.css';

function GenresPage() {
  const { t, i18n } = useTranslation();
  const [genres, setGenres]         = useState([]);
  const [activeGenre, setActiveGenre] = useState(null);
  const [movies, setMovies]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // Load genres on mount or when language changes
  useEffect(() => {
    getGenres().then((r) => {
      setGenres(r.data.genres);
      // Auto-select first genre if none active, or refreshing after lang change
      if (r.data.genres.length > 0) {
        const matching = r.data.genres.find(g => g.id === activeGenre?.id) || r.data.genres[0];
        handleGenreSelect(matching);
      }
    });
  }, [i18n.language]); // eslint-disable-line

  const handleGenreSelect = async (genre) => {
    setActiveGenre(genre);
    setMovies([]);
    setPage(1);
    setLoading(true);
    try {
      const res = await getMoviesByGenre(genre.id, 1);
      setMovies(res.data.results);
      setTotalPages(res.data.total_pages);
      setHasMore(res.data.page < res.data.total_pages);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!activeGenre || loading) return;
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await getMoviesByGenre(activeGenre.id, nextPage);
      setMovies((prev) => [...prev, ...res.data.results]);
      setPage(nextPage);
      setHasMore(nextPage < totalPages);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="genres-page page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="genres-page__header container">
        <h1>{t('details.browseByGenre')}</h1>
        <p>{t('details.discoverMovies')}</p>
      </div>

      {/* Genre pills */}
      <div className="genres-page__pills container">
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`genre-pill ${activeGenre?.id === genre.id ? 'active' : ''}`}
            onClick={() => handleGenreSelect(genre)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Movies grid */}
      <div className="genres-page__content container">
        {activeGenre && (
          <h2 className="section-title">{activeGenre.name}</h2>
        )}

        <div className="genres-page__grid">
          {movies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}

          {loading && Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={`sk-${i}`} type="card" />
          ))}
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="genres-page__load-more">
            <button className="btn-primary" onClick={loadMore}>
              {t('details.loadMore')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default GenresPage;
