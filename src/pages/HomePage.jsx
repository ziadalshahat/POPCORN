import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import { getPopular, getTopRated, getTrending, getMoviesByGenre, getGenres } from '../api/tmdb';
import './HomePage.css';

function HomePage() {
  const [trending, setTrending]       = useState([]);
  const [popular, setPopular]         = useState([]);
  const [topRated, setTopRated]       = useState([]);
  const [action, setAction]           = useState([]);
  const [comedy, setComedy]           = useState([]);
  const [loadingTrending, setLT]      = useState(true);
  const [loadingPopular, setLP]       = useState(true);
  const [loadingTopRated, setLTR]     = useState(true);
  const [loadingAction, setLA]        = useState(true);
  const [loadingComedy, setLC]        = useState(true);

  useEffect(() => {
    getTrending().then(r => { setTrending(r.data.results); setLT(false); }).catch(() => setLT(false));
    getPopular().then(r => { setPopular(r.data.results); setLP(false); }).catch(() => setLP(false));
    getTopRated().then(r => { setTopRated(r.data.results); setLTR(false); }).catch(() => setLTR(false));
    // Fetch Action (id 28) and Comedy (id 35) genre movies
    getMoviesByGenre(28).then(r => { setAction(r.data.results); setLA(false); }).catch(() => setLA(false));
    getMoviesByGenre(35).then(r => { setComedy(r.data.results); setLC(false); }).catch(() => setLC(false));
  }, []);

  return (
    <motion.main
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero — auto-rotating trending banner */}
      <HeroBanner />

      {/* Movie rows */}
      <div className="home-page__rows">
        <MovieRow
          title="🔥 Trending Today"
          movies={trending}
          loading={loadingTrending}
        />
        <MovieRow
          title="🎬 Popular Movies"
          movies={popular}
          loading={loadingPopular}
        />
        <MovieRow
          title="⭐ Top Rated"
          movies={topRated}
          loading={loadingTopRated}
        />
        <MovieRow
          title="💥 Action & Thriller"
          movies={action}
          loading={loadingAction}
        />
        <MovieRow
          title="😄 Comedy"
          movies={comedy}
          loading={loadingComedy}
        />
      </div>
    </motion.main>
  );
}

export default HomePage;
