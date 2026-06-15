'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useOmSound } from '@/components/sound/OmSound';

interface SplashScreenProps {
  onComplete: () => void;
  /** Duration in ms before auto-dismiss */
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 3500 }: SplashScreenProps) {
  const [show, setShow] = useState(true);
  const { play: playOm } = useOmSound();

  useEffect(() => {
    // Play Om sound on first interaction or after a short delay
    const playTimeout = setTimeout(() => {
      playOm();
    }, 500);

    const hideTimeout = setTimeout(() => {
      setShow(false);
    }, duration);

    return () => {
      clearTimeout(playTimeout);
      clearTimeout(hideTimeout);
    };
  }, [duration, playOm]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        >
          {/* Expanding rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-[#c97a24]"
              initial={{ width: 60, height: 60, opacity: 0 }}
              animate={{
                width: [60, 300 + ring * 80],
                height: [60, 300 + ring * 80],
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 2.5,
                delay: ring * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Central Logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{
              duration: 1.2,
              delay: 0.3,
              ease: [0.25, 0.8, 0.25, 1],
            }}
          >
            {/* Glowing logo container */}
            <motion.div
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #c97a24, #e8a23c)',
                boxShadow: '0 0 60px rgba(201, 122, 36, 0.4), 0 0 120px rgba(201, 122, 36, 0.2)',
              }}
              animate={{
                boxShadow: [
                  '0 0 60px rgba(201, 122, 36, 0.4), 0 0 120px rgba(201, 122, 36, 0.2)',
                  '0 0 80px rgba(201, 122, 36, 0.6), 0 0 160px rgba(201, 122, 36, 0.3)',
                  '0 0 60px rgba(201, 122, 36, 0.4), 0 0 120px rgba(201, 122, 36, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                className="text-5xl font-bold text-white"
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                व
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="mb-2 text-4xl font-bold tracking-[0.15em] text-white"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              VEDA
            </motion.h1>

            {/* Sanskrit subtitle */}
            <motion.p
              className="text-sm tracking-widest text-[#c97a24]"
              style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              ज्ञानं परमं बलम्
            </motion.p>

            {/* English subtitle */}
            <motion.p
              className="mt-1 text-xs tracking-[0.2em] text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              KNOWLEDGE OPERATING SYSTEM
            </motion.p>
          </motion.div>

          {/* Bottom loading bar */}
          <motion.div
            className="absolute bottom-16 h-[2px] w-48 overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#c97a24] to-[#e8a23c]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000 - 0.5, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
