import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowsPage from './pages/TVShowsPage';
import TVDetailPage from './pages/TVDetailPage';
import SearchPage from './pages/SearchPage';
import GenresPage from './pages/GenresPage';
import AuthPage from './pages/AuthPage';
import WatchlistPage from './pages/WatchlistPage';
import NotFoundPage from './pages/NotFoundPage';
import ActorDetailPage from './pages/ActorDetailPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"           element={<HomePage />} />
            <Route path="/movie/:id"  element={<MovieDetailPage />} />
            <Route path="/tv"         element={<TVShowsPage />} />
            <Route path="/tv/:id"     element={<TVDetailPage />} />
            <Route path="/actor/:id"  element={<ActorDetailPage />} />
            <Route path="/movies"     element={<GenresPage />} />
            <Route path="/search"     element={<SearchPage />} />
            <Route path="/genres"     element={<GenresPage />} />
            <Route path="/auth"       element={<AuthPage />} />
            <Route path="/watchlist"  element={<WatchlistPage />} />
            <Route path="/profile"   element={<ProfilePage />} />
            <Route path="*"           element={<NotFoundPage />} />
          </Routes>
          <Footer />

          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
