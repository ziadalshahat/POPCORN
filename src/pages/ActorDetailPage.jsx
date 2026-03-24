import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getPersonDetails, getPersonCredits, buildImageUrl, POSTER_SIZE, normaliseItem } from '../api/tmdb';
import MovieRow from '../components/MovieRow';
import SkeletonLoader from '../components/SkeletonLoader';
import './ActorDetailPage.css';

function ActorDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [actor, setActor] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setLoading(true);
    setError(null);

    Promise.all([
      getPersonDetails(id),
      getPersonCredits(id)
    ])
      .then(([detailsRes, creditsRes]) => {
        setActor(detailsRes.data);
        
        // Filter out items without posters and sort by popularity
        const knownFor = creditsRes.data.cast
          .filter(item => item.poster_path)
          .sort((a, b) => b.popularity - a.popularity)
          .map(item => normaliseItem(item, item.media_type || 'movie'));
          
        setCredits(knownFor);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, t]);

  if (loading) return <div className="page-wrapper"><SkeletonLoader type="actor-detail" /></div>;

  if (error || !actor) {
    return (
      <div className="page-wrapper error-state">
        <h3>{t('details.couldNotLoad')}</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>{t('details.goBack')}</button>
      </div>
    );
  }

  const profileUrl = buildImageUrl(actor.profile_path, POSTER_SIZE);
  const gender = actor.gender === 1 ? 'Female' : actor.gender === 2 ? 'Male' : 'Unknown';

  return (
    <motion.div
      className="actor-detail container page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="actor-detail__header">
        <button className="btn-secondary actor-detail__back" onClick={() => navigate(-1)}>
          {t('details.back')}
        </button>
      </div>

      <div className="actor-detail__content">
        {/* Left Col: Profile Image & Personal Info */}
        <motion.div
          className="actor-detail__sidebar"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="actor-detail__image">
            {profileUrl ? (
              <img src={profileUrl} alt={actor.name} />
            ) : (
              <div className="actor-detail__no-image">{t('details.noImage')}</div>
            )}
          </div>
          
          <div className="actor-detail__personal-info glass-card">
            <h3>{t('details.personalInfo')}</h3>
            
            <div className="info-group">
              <strong>{t('details.knownFor')}</strong>
              <span>{actor.known_for_department}</span>
            </div>
            
            <div className="info-group">
              <strong>{t('details.gender')}</strong>
              <span>{gender}</span>
            </div>
            
            {actor.birthday && (
              <div className="info-group">
                <strong>{t('details.birthday')}</strong>
                <span>{actor.birthday}</span>
              </div>
            )}
            
            {actor.place_of_birth && (
              <div className="info-group">
                <strong>{t('details.placeOfBirth')}</strong>
                <span>{actor.place_of_birth}</span>
              </div>
            )}
            
            {actor.deathday && (
              <div className="info-group">
                <strong>{t('details.dayOfDeath')}</strong>
                <span>{actor.deathday}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Col: Biography & Credits */}
        <motion.div
          className="actor-detail__main"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="actor-detail__name">{actor.name}</h1>
          
          <div className="actor-detail__biography">
            <h2>{t('details.biography')}</h2>
            {actor.biography ? (
              <div className="biography-text">
                {actor.biography.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="no-bio">{t('details.noBio', { name: actor.name })}</p>
            )}
          </div>

          {credits.length > 0 && (
            <div className="actor-detail__credits">
              <MovieRow title={t('details.knownFor')} movies={credits} cardCount={10} />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ActorDetailPage;
