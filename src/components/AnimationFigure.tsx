import React from 'react';
import { motion } from 'framer-motion';

interface AnimationFigureProps {
  type: 'neck' | 'shoulder' | 'wrist' | 'back' | 'eye';
  action: string;
  isActive?: boolean;
}

export const AnimationFigure: React.FC<AnimationFigureProps> = ({ type, action, isActive = true }) => {
  const getAnimation = () => {
    switch (action) {
      case 'neck-turn':
        return {
          head: {
            animate: { rotate: [-15, 15, -15] },
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          },
        };
      case 'neck-tilt':
        return {
          head: {
            animate: { y: [0, -10, 0] },
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          },
        };
      case 'shoulder-shrug':
        return {
          shoulders: {
            animate: { y: [0, -15, 0] },
            transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          },
        };
      case 'wrist-roll':
        return {
          hands: {
            animate: { rotate: [0, 360] },
            transition: { duration: 2, repeat: Infinity, ease: 'linear' },
          },
        };
      case 'back-stretch':
        return {
          torso: {
            animate: { rotate: [-10, 10, -10] },
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          },
        };
      case 'eye-blink':
        return {
          eyes: {
            animate: { scaleY: [1, 0.1, 1] },
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          },
        };
      default:
        return {
          all: {
            animate: { y: [0, -5, 0] },
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          },
        };
    }
  };

  const animation = getAnimation();

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <svg viewBox="0 0 200 250" className="w-48 h-60">
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ECDC4" />
            <stop offset="100%" stopColor="#3DB8AF" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={animation.torso?.animate}
          transition={animation.torso?.transition}
        >
          <motion.g
            style={{ transformOrigin: '100px 60px' }}
            animate={animation.head?.animate}
            transition={animation.head?.transition}
          >
            <circle cx="100" cy="50" r="35" fill="url(#bodyGradient)" opacity="0.9" />
            <motion.g
              animate={animation.eyes?.animate}
              transition={animation.eyes?.transition}
              style={{ transformOrigin: '100px 45px' }}
            >
              <ellipse cx="85" cy="45" rx="6" ry="8" fill="#2C3E50" />
              <ellipse cx="115" cy="45" rx="6" ry="8" fill="#2C3E50" />
            </motion.g>
            <path d="M90 65 Q100 72 110 65" stroke="#2C3E50" strokeWidth="2" fill="none" />
          </motion.g>

          <motion.g
            animate={animation.shoulders?.animate}
            transition={animation.shoulders?.transition}
          >
            <ellipse cx="50" cy="100" rx="20" ry="15" fill="url(#bodyGradient)" opacity="0.8" />
            <ellipse cx="150" cy="100" rx="20" ry="15" fill="url(#bodyGradient)" opacity="0.8" />
          </motion.g>

          <rect x="75" y="85" width="50" height="80" rx="10" fill="url(#bodyGradient)" opacity="0.7" />

          <motion.g
            animate={animation.hands?.animate}
            transition={animation.hands?.transition}
            style={{ transformOrigin: '40px 120px' }}
          >
            <rect x="25" y="95" width="30" height="12" rx="6" fill="url(#bodyGradient)" opacity="0.8" />
            <circle cx="25" cy="101" r="10" fill="url(#bodyGradient)" opacity="0.9" />
          </motion.g>

          <motion.g
            animate={animation.hands?.animate}
            transition={{ ...animation.hands?.transition, delay: 0.5 }}
            style={{ transformOrigin: '160px 120px' }}
          >
            <rect x="145" y="95" width="30" height="12" rx="6" fill="url(#bodyGradient)" opacity="0.8" />
            <circle cx="175" cy="101" r="10" fill="url(#bodyGradient)" opacity="0.9" />
          </motion.g>

          <rect x="80" y="165" width="18" height="60" rx="8" fill="url(#bodyGradient)" opacity="0.7" />
          <rect x="102" y="165" width="18" height="60" rx="8" fill="url(#bodyGradient)" opacity="0.7" />
        </motion.g>

        {!isActive && (
          <rect x="0" y="0" width="200" height="250" fill="white" opacity="0.5" rx="10" />
        )}
      </svg>
    </div>
  );
};
