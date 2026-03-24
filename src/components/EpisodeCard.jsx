import { useTranslation } from 'react-i18next';
import { buildImageUrl, STILL_SIZE } from '../api/tmdb';
import './EpisodeCard.css';

/**
 * EpisodeCard — Displays a single TV episode.
 *
 * Props:
 *   episode  – TMDB episode object from /tv/:id/season/:n
 */
function EpisodeCard({ episode }) {
  const { t } = useTranslation();
  if (!episode) return null;

  const still   = buildImageUrl(episode.still_path, STILL_SIZE);
  const airDate = episode.air_date?.slice(0, 4) || '';
  const rating  = episode.vote_average?.toFixed(1);

  return (
    <div className="episode-card">
      {/* Still image */}
      <div className="episode-card__still">
        {still ? (
          <img src={still} alt={episode.name} loading="lazy" />
        ) : (
          <div className="episode-card__no-still">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" />
            </svg>
          </div>
        )}
        <span className="episode-card__number">
          {t('details.episodeNumber', { number: episode.episode_number })}
        </span>
      </div>

      {/* Info */}
      <div className="episode-card__info">
        <h4 className="episode-card__name">
          {episode.name || t('details.episodeNumber', { number: episode.episode_number })}
        </h4>
        <div className="episode-card__meta">
          {airDate && <span>{airDate}</span>}
          {rating && parseFloat(rating) > 0 && (
            <span className="episode-card__rating">⭐ {rating}</span>
          )}
          {episode.runtime && (
            <span>{episode.runtime}m</span>
          )}
        </div>
        {episode.overview && (
          <p className="episode-card__overview">
            {episode.overview.slice(0, 130)}
            {episode.overview.length > 130 ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default EpisodeCard;
