import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { buildImageUrl, POSTER_SIZE } from '../api/tmdb';
import './ActorCard.css';

function ActorCard({ actor, delay = 0 }) {
  const navigate = useNavigate();
  const profileUrl = buildImageUrl(actor.profile_path, POSTER_SIZE);

  return (
    <motion.div
      className="actor-card glass-card"
      onClick={() => navigate(`/actor/${actor.id}`)}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5 }}
    >
      <div className="actor-card__image">
        {profileUrl ? (
          <img src={profileUrl} alt={actor.name} loading="lazy" />
        ) : (
          <div className="actor-card__placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      <div className="actor-card__info">
        <h4 className="actor-card__name">{actor.name}</h4>
        {actor.character && (
          <p className="actor-card__character">{actor.character}</p>
        )}
      </div>
    </motion.div>
  );
}

export default ActorCard;
