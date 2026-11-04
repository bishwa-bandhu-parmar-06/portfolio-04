'use client';

import { LazyMotion, MotionConfig, domAnimation, m, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/** Loads the animation engine once and honours the visitor's reduced-motion setting. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/** Fades and slides its content in the first time it scrolls into view. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <m.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ delay }}
    >
      {children}
    </m.div>
  );
}

/** Container whose <StaggerItem> children animate in one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <m.div className={className} variants={fadeUp}>
      {children}
    </m.div>
  );
}
