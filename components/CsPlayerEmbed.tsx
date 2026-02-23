import React from 'react';

type CsPlayerEmbedProps = {
  videoId: string;
  autoplay?: boolean;
};

const CsPlayerEmbed: React.FC<CsPlayerEmbedProps> = ({ videoId, autoplay = false }) => {
  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 text-sm font-bold">
        Video ID tapilmadi.
      </div>
    );
  }

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });

  return (
    <iframe
      className="w-full aspect-video"
      src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
      title="Podcast video player"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
};

export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\/+/, '').slice(0, 11);
      return id || null;
    }
    if (parsed.pathname.includes('/shorts/')) {
      const id = parsed.pathname.split('/shorts/')[1]?.slice(0, 11);
      return id || null;
    }
    if (parsed.pathname.includes('/embed/')) {
      const id = parsed.pathname.split('/embed/')[1]?.slice(0, 11);
      return id || null;
    }
    const v = parsed.searchParams.get('v');
    if (v) return v.slice(0, 11);
  } catch {
    // URL parse fails on partial links; continue with regex fallback.
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export default CsPlayerEmbed;
