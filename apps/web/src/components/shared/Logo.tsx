'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      whileHover="hover"
      initial="initial"
      style={{ width: size, height: size }}
    >
      {/* Outer pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-blue-500/10 border border-blue-500/20"
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.08, rotate: 90, borderRadius: '16px' },
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />

      {/* SVG Icon */}
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-600 relative z-10"
      >
        {/* Heart Vector shape */}
        <motion.path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          variants={{
            initial: { pathLength: 1, fill: 'rgba(59, 130, 246, 0)' },
            hover: { 
              pathLength: [1, 0, 1],
              fill: 'rgba(59, 130, 246, 0.08)',
              transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
            }
          }}
        />

        {/* EKG Pulse path crossing the center */}
        <motion.path
          d="M6 12h3l2-4 2 8 2-4h3"
          stroke="#2563eb"
          strokeWidth="3"
          variants={{
            initial: { pathLength: 1 },
            hover: {
              pathOffset: [0, 1],
              transition: { duration: 1.5, ease: 'linear', repeat: Infinity }
            }
          }}
        />
      </svg>
    </motion.div>
  );
};
