import './SkeletonLoader.css';

/**
 * SkeletonLoader — Shimmer placeholder for various content types
 * @param {'card' | 'banner' | 'detail' | 'text'} type
 */
function SkeletonLoader({ type = 'card', count = 1 }) {
  if (type === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card__poster shimmer" />
        <div className="skeleton-card__title shimmer" />
        <div className="skeleton-card__meta shimmer" />
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div className="skeleton-detail">
        <div className="skeleton-detail__backdrop shimmer" />
        <div className="skeleton-detail__body">
          <div className="skeleton-detail__poster shimmer" />
          <div className="skeleton-detail__info">
            <div className="skeleton-text shimmer" style={{ width: '60%', height: 36 }} />
            <div className="skeleton-text shimmer" style={{ width: '40%', height: 20 }} />
            <div className="skeleton-text shimmer" style={{ width: '80%', height: 14 }} />
            <div className="skeleton-text shimmer" style={{ width: '70%', height: 14 }} />
            <div className="skeleton-text shimmer" style={{ width: '50%', height: 14 }} />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="skeleton-text-block">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="skeleton-text shimmer"
            style={{ width: i % 3 === 2 ? '70%' : '100%', height: 16 }}
          />
        ))}
      </div>
    );
  }

  return <div className="shimmer" style={{ width: '100%', height: 200, borderRadius: 12 }} />;
}

export default SkeletonLoader;
