import { socialLinks } from '@/app/data/links';

/** The YouTube channel header screenshot, linked to the channel. */
export default function ChannelCard() {
  return (
    <a
      href={socialLinks.youtube.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block max-w-[908px] overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgba(20,20,19,0.6)] ring-1 ring-ink/5 transition-transform duration-500 hover:-translate-y-1 sm:rounded-3xl"
    >
      <img
        src="/content/youtube-channel.png"
        alt="Maheen Rassell's YouTube channel, @mrassell: 43 subscribers, 18 videos. 13 year old me was onto something"
        width={1816}
        height={378}
        className="block h-auto w-full"
      />
    </a>
  );
}
