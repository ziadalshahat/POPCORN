import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import spidyImg from '../images/marvel.png';
import './LogoutModal.css';

function LogoutModal({ isOpen, onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="logout-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <div className="logout-modal__wrapper">
          <motion.div
            className="logout-modal"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="logout-modal__sticker">
              <img
                src={spidyImg}
                alt="Sad Spider-Man"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <h3 className="logout-modal__title">
              {t('logout.title', 'Are you sure you wanna leave, Spidy?')}
            </h3>
            <p className="logout-modal__subtitle">
              {t('logout.subtitle', "We'll miss you! Your watchlist will be waiting.")}
            </p>

            <div className="logout-modal__actions">
              <button className="logout-modal__btn logout-modal__btn--cancel" onClick={onCancel}>
                {t('logout.stay', 'Nah, Stay!')}
              </button>
              <button className="logout-modal__btn logout-modal__btn--confirm" onClick={onConfirm}>
                {t('logout.leave', 'Yes, Leave')}
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default LogoutModal;
