'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TopProgressBarProps {
  isLoading: boolean;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[100] h-1 bg-[#D6CFC7]/40 overflow-hidden pointer-events-none"
          id="top-indeterminate-progress-bar"
        >
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-[#5A5A40] via-[#2D2926] to-[#B85D3D] shadow-sm"
            initial={{ x: '-100%' }}
            animate={{ x: '350%' }}
            transition={{
              repeat: Infinity,
              duration: 0.85,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

