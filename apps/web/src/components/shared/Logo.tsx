'use client';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  size?: number;
  textVisible?: boolean;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 34,
  textVisible = true,
  showTagline = false,
}) => {
  return (
    <motion.div
      className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${className}`}
      whileHover="hover"
      initial="initial"
    >
      {/* Heart Icon Container */}
      <motion.div
        className="relative flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 shadow-sm p-1.5"
        style={{ width: size, height: size }}
        variants={{
          initial: { scale: 1 },
          hover: { scale: 1.06, rotate: 3 },
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Pulsing Backlight Glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-md -z-10"
          variants={{
            initial: { opacity: 0, scale: 0.8 },
            hover: { opacity: 1, scale: 1.15 },
          }}
          transition={{ duration: 0.3 }}
        />

        {/* SVG Heart & EKG Pulse Vector Icon */}
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
              initial: { pathLength: 1, fill: 'rgba(37, 99, 235, 0.05)' },
              hover: {
                pathLength: [1, 0.9, 1],
                fill: 'rgba(37, 99, 235, 0.15)',
                transition: { duration: 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
              }
            }}
          />

          {/* EKG Pulse path crossing center */}
          <motion.path
            d="M6 12h3l2-4 2 8 2-4h3"
            stroke="#2563eb"
            strokeWidth="2.75"
            variants={{
              initial: { pathLength: 1 },
              hover: {
                pathOffset: [0, 1],
                transition: { duration: 1.2, ease: 'linear', repeat: Infinity }
              }
            }}
          />
        </svg>
      </motion.div>

      {/* Interactive MediCore 360 Typography */}
      {textVisible && (
        <div className="flex flex-col justify-center min-w-0 leading-none">
          <div className="flex items-center gap-1.5">
            <motion.span
              className="font-black tracking-tight text-slate-900 text-lg sm:text-xl font-sans"
              variants={{
                initial: { x: 0 },
                hover: { x: 1 }
              }}
            >
              MediCore
            </motion.span>
            <motion.span
              className="font-black text-lg sm:text-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight"
              variants={{
                initial: { scale: 1 },
                hover: { scale: 1.08 }
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              360
            </motion.span>
            {showTagline && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200/80 text-[8.5px] font-black uppercase tracking-wider hidden sm:inline-block">
                EHMS
              </span>
            )}
          </div>
          {showTagline && (
            <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Enterprise Healthcare
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
