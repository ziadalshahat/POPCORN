import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

// PLACEHOLDER: Please replace this URL with your preferred Spiderman vs Venom image or import a local asset
const battleImageUrl = "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=800"; 

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-bg" />
      
      <div className="not-found-content">
        <motion.div 
          className="not-found-title-container"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="glitch-text"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(192, 132, 252, 0.4)",
                "0 0 40px rgba(255, 59, 59, 0.6)",
                "0 0 20px rgba(192, 132, 252, 0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.h1>
          <h2 className="not-found-subtitle">Universe Collapsed</h2>
          <p className="not-found-description">The web you're trying to swing to doesn't exist.</p>
        </motion.div>

        <motion.div 
          className="battle-container"
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring", bounce: 0.5 }}
        >
          <motion.div
            className="clash-effect"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.img 
            src={battleImageUrl} 
            alt="Spiderman vs Venom" 
            className="battle-image"
            animate={{ 
              y: [0, -15, 0],
              rotate: [-1, 2, -1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/" className="home-button">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Return to Homepage
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
