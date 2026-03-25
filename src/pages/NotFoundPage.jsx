import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import bgImage from '../images/404-bg.png';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="cinematic-404">
      {/* Background with cinematic image */}
      <div 
        className="cinematic-404__bg" 
        style={{ backgroundImage: `url(${bgImage})` }} 
      />
      <div className="cinematic-404__overlay" />

      <div className="cinematic-404__content">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1 
            className="cinematic-404__code"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(229, 9, 20, 0.4)", 
                "0 0 30px rgba(229, 9, 20, 0.8)", 
                "0 0 10px rgba(229, 9, 20, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.h1>
          
          <motion.div 
            className="cinematic-404__text-box"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2 className="cinematic-404__title">SCENE NOT FOUND</h2>
            <p className="cinematic-404__desc">
              It seems the reel has cut short. The movie you're looking for was never filmed, or it's been lost in the cutting room.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link to="/" className="cinematic-404__btn" style={{ textDecoration: 'none' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Return Home
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative film grain/dust particles effect */}
      <div className="film-grain" />
    </div>
  );
};

export default NotFoundPage;
