'use client';

import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Format with locale separators */
  format?: boolean;
}

export function AnimatedCounter({
  target,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
  format = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const count = useMotionValue(0);
  const rounded = useSpring(count, { duration: duration * 1000 });

  useEffect(() => {
    if (isInView) {
      animate(count, target, {
        duration,
        ease: [0.25, 0.8, 0.25, 1],
      });
    }
  }, [isInView, target, duration, count]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) {
        const value = Math.round(v);
        ref.current.textContent = `${prefix}${format ? value.toLocaleString() : value}${suffix}`;
      }
    });
    return unsubscribe;
  }, [rounded, prefix, suffix, format]);

  return (
    <motion.span
      ref={ref}
      className={className}
    >
      {prefix}0{suffix}
    </motion.span>
  );
}
