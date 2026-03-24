import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import HeroBanner from '../components/HeroBanner';
import MovieRow from '../components/MovieRow';
import {
  getPopular, getTopRated, getTrending, getMoviesByGenre,
  getTrendingTV, getPopularTV,
} from '../api/tmdb';
import './HomePage.css';

function HomePage() {
  const { t, i18n } = useTranslation();
  const [trending, setTrending]     = useState([]);
  const [popular, setPopular]       = useState([]);
  const [topRated, setTopRated]     = useState([]);
  const [action, setAction]         = useState([]);
  const [comedy, setComedy]         = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [popularTV, setPopularTV]   = useState([]);

  const [loadingT, setLT]   = useState(true);
  const [loadingP, setLP]   = useState(true);
  const [loadingTR, setLTR] = useState(true);
  const [loadingA, setLA]   = useState(true);
  const [loadingC, setLC]   = useState(true);
  const [loadingTT, setLTT] = useState(true);
  const [loadingPT, setLPT] = useState(true);

  useEffect(() => {
    setLT(true); setLP(true); setLTR(true); setLA(true); setLC(true); setLTT(true); setLPT(true);
    getTrending().then(r => { setTrending(r.data.results); setLT(false); }).catch(() => setLT(false));
    getPopular().then(r => { setPopular(r.data.results); setLP(false); }).catch(() => setLP(false));
    getTopRated().then(r => { setTopRated(r.data.results); setLTR(false); }).catch(() => setLTR(false));
    getMoviesByGenre(28).then(r => { setAction(r.data.results); setLA(false); }).catch(() => setLA(false));
    getMoviesByGenre(35).then(r => { setComedy(r.data.results); setLC(false); }).catch(() => setLC(false));
    getTrendingTV().then(r => { setTrendingTV(r.data.results); setLTT(false); }).catch(() => setLTT(false));
    getPopularTV().then(r => { setPopularTV(r.data.results); setLPT(false); }).catch(() => setLPT(false));
  }, [i18n.language]);

  return (
    <motion.main
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero — auto-rotating trending banner (movies + TV) */}
      <HeroBanner />

      {/* Content rows */}
      <div className="home-page__rows">
        <MovieRow title={t('home.trendingMovies')} movies={trending} loading={loadingT} mediaType="movie" />
        <MovieRow title={t('home.trendingTV')} movies={trendingTV} loading={loadingTT} mediaType="tv" />
        <MovieRow title={t('home.popularMovies')} movies={popular} loading={loadingP} mediaType="movie" />
        <MovieRow title={t('home.popularTV')} movies={popularTV} loading={loadingPT} mediaType="tv" />
        <MovieRow title={t('home.topRatedMovies')} movies={topRated} loading={loadingTR} mediaType="movie" />
        <MovieRow title={t('home.action')} movies={action} loading={loadingA} mediaType="movie" />
        <MovieRow title={t('home.comedy')} movies={comedy} loading={loadingC} mediaType="movie" />
      </div>
    </motion.main>
  );
}

export default HomePage;
