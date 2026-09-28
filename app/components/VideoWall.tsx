'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { embedSrc, videos, type Video } from '@/app/data/videos';

const ease = [0.22, 1, 0.36, 1] as const;

// Ask TikTok's player to stay muted so browsers let it autoplay
function muteTikTok(frame: HTMLIFrameElement) {
  frame.contentWindow?.postMessage({ type: 'mute', value: undefined, 'x-tiktok-player': true }, '*');
  frame.contentWindow?.postMessage({ type: 'play', value: undefined, 'x-tiktok-player': true }, '*');
}

function Caption({ video, index }: { video: Video; index: number }) {
  const label = video.platform === 'youtube' ? 'YouTube' : 'TikTok';
  return (
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
      <span className="text-stone-400">
        <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
        <span className="ml-3 font-medium text-paper">{video.title ?? label}</span>
      </span>
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1 text-stone-400 transition-colors hover:text-paper"
      >
        Watch with sound
        <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      </a>
    </div>
  );
}

function Frame({ video, index, className, tilt = 0 }: { video: Video; index: number; className?: string; tilt?: number }) {
  const isTikTok = video.platform === 'tiktok';
  return (
    <motion.figure
      className={className}
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, ease, delay: (index % 2) * 0.12 }}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10',
          isTikTok ? 'aspect-[9/16] rounded-[2.25rem] border-[6px] border-[#2a2926]' : 'aspect-video rounded-3xl',
        )}
      >
        <iframe
          src={embedSrc(video)}
          title={`${isTikTok ? 'TikTok' : 'YouTube'} video ${index + 1} by Maheen Rassell`}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          onLoad={isTikTok ? (e) => muteTikTok(e.currentTarget) : undefined}
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <Caption video={video} index={index} />
    </motion.figure>
  );
}

export default function VideoWall() {
  const youtube = videos.filter((v) => v.platform === 'youtube');
  const tiktok = videos.filter((v) => v.platform === 'tiktok');

  return (
    <section className="relative overflow-hidden bg-ink py-20 text-paper md:py-28">
      {/* Soft coloured light behind the screens */}
      <div aria-hidden className="pointer-events-none absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-[#ef8a6f]/20 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 h-[36rem] w-[36rem] rounded-full bg-[#8d77d4]/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4 md:mb-16">
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm text-stone-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Now playing
            </p>
            <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">The screening room</h2>
          </div>
          <p className="max-w-xs text-sm text-stone-400">Everything plays muted here. Tap a video for sound, or open it on the platform.</p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          {/* YouTube, stacked and slightly offset */}
          <div className="space-y-12 lg:col-span-7">
            {youtube.map((v, i) => (
              <Frame key={v.id} video={v} index={i} className={i % 2 === 1 ? 'lg:ml-16' : 'lg:mr-16'} />
            ))}
          </div>

          {/* TikTok phones, tilted towards each other */}
          <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:col-span-5 lg:pt-16">
            {tiktok.map((v, i) => (
              <Frame
                key={v.id}
                video={v}
                index={youtube.length + i}
                tilt={i === 0 ? -3 : 3}
                className={cn('min-w-0', i === 1 && 'mt-16')}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
