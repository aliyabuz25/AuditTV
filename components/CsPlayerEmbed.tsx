import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    csPlayer?: any;
  }
}

type CsPlayerEmbedProps = {
  videoId: string;
  autoplay?: boolean;
};

const CsPlayerEmbed: React.FC<CsPlayerEmbedProps> = ({ videoId, autoplay = false }) => {
  const containerIdRef = useRef(`cs-player-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setError('Video ID tapılmadı.');
      return;
    }

    if (!window.csPlayer) {
      setError('csPlayer yüklənməyib.');
      return;
    }

    setError(null);
    const selector = `#${containerIdRef.current}`;
    const player = new window.csPlayer(selector, {
      videoId,
      autoplay,
      volume: 70,
      keyboardShortcuts: true,
      showVolumeControl: true,
      showFullscreenButton: true,
      borderRadius: '20px',
    });

    player.mount();

    return () => {
      try {
        if (typeof player.destroy === 'function') {
          player.destroy();
        }
      } catch {
        // no-op
      }
      const node = document.getElementById(containerIdRef.current);
      if (node) node.innerHTML = '';
    };
  }, [videoId, autoplay]);

  if (error) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 text-sm font-bold">
        {error}
      </div>
    );
  }

  return <div id={containerIdRef.current} className="w-full" />;
};

export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;

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
