export interface Video {
  id: string;
  platform: 'youtube' | 'tiktok';
  url: string;
  /** Seconds to start from (YouTube only). */
  start?: number;
  /** Optional caption; falls back to the platform name. */
  title?: string;
}

export const videos: Video[] = [
  { id: 'y60T47xeAGA', platform: 'youtube', url: 'https://www.youtube.com/watch?v=y60T47xeAGA', start: 7 },
  { id: '-xcR4uziRRo', platform: 'youtube', url: 'https://www.youtube.com/watch?v=-xcR4uziRRo', start: 5 },
  { id: '7576061243321011486', platform: 'tiktok', url: 'https://www.tiktok.com/@timproductions/video/7576061243321011486' },
  { id: '7639632511466851614', platform: 'tiktok', url: 'https://www.tiktok.com/@timproductions/video/7639632511466851614' },
];

export function embedSrc(v: Video) {
  if (v.platform === 'youtube') {
    // Muted autoplay is the only kind browsers allow; playlist=<id> makes loop work for a single video
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      loop: '1',
      playlist: v.id,
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      start: String(v.start ?? 0),
    });
    return `https://www.youtube-nocookie.com/embed/${v.id}?${params}`;
  }
  const params = new URLSearchParams({
    autoplay: '1',
    loop: '1',
    music_info: '0',
    description: '0',
    rel: '0',
  });
  return `https://www.tiktok.com/player/v1/${v.id}?${params}`;
}
