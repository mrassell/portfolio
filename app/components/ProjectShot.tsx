'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * A project screenshot that wipes open as it scrolls into view, then drifts
 * slightly inside its frame while the page keeps scrolling.
 */
export default function ProjectShot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.04, 1.12]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative aspect-[3/2] overflow-hidden rounded-2xl bg-stone-200 shadow-[0_24px_48px_-24px_rgba(20,20,19,0.35)] ring-1 ring-ink/5',
        className,
      )}
      initial={{ opacity: 0, y: 32, clipPath: 'inset(12% 12% 12% 12% round 24px)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 16px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ y, scale }}
      />
    </motion.div>
  );
}
