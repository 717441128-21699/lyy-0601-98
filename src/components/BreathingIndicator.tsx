import React from 'react';
import { motion } from 'framer-motion';

interface BreathingIndicatorProps {
  isActive?: boolean;
  size?: number;
}

export const BreathingIndicator: React.FC<BreathingIndicatorProps> = ({
  isActive = true,
  size = 60,
}) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full bg-primary-200"
        animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.6, 0.3, 0.6] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-primary-300"
        animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.7, 0.4, 0.7] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute inset-4 rounded-full bg-primary-400 flex items-center justify-center"
        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <span className="text-white text-xs font-bold">呼吸</span>
      </motion.div>
    </div>
  );
};
