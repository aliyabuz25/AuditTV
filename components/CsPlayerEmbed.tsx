import React, { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    YT?: {
      Player?: new (elementId: string, options: unknown) => unknown;
    };
    onYouTubeIframeAPIReady?: (() => void) | null;
    csPlayer?: {
      init: (playerId: string, params: Record<string, unknown>) => Promise<void>;
      destroy: (playerId: string) => void;
      play: (playerId: string) => void;
      getPlayerState: (playerId: string) => string;
    };
  }
}

const YT_IFRAME_API_URL = 'https://www.youtube.com/iframe_api';
const CS_PLAYER_STYLE_URL = 'https://cdn.jsdelivr.net/gh/abtp2/csPlayer/src/csPlayer.css';
const CS_PLAYER_SCRIPT_URL = 'https://cdn.jsdelivr.net/gh/abtp2/csPlayer/src/csPlayer.js';

let youtubeApiPromise: Promise<void> | null = null;
let csPlayerAssetsPromise: Promise<void> | null = null;

function applyCsPlayerBrandTheme(host: HTMLElement) {
  const playerRoot = host.querySelector('.csPlayer');
  if (!(playerRoot instanceof HTMLElement)) return;

  playerRoot.style.setProperty('--startBtnBg', '#4f6be4');
  playerRoot.style.setProperty('--sliderThumbColor', '#4f6be4');
  playerRoot.style.setProperty('--sliderSeekTrackColor', '#4f6be4');
  playerRoot.style.setProperty('--settingsInputIconColor', '#4f6be4');
  playerRoot.style.setProperty('--settingsBg', '#0f172a');
  playerRoot.style.setProperty('--settingsTextColor', '#e2e8f0');
}

function ensureScript(id: string, src: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve();

  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === 'true') return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.addEventListener(
      'load',
      () => {
        script.dataset.loaded = 'true';
        resolve();
      },
      { once: true },
    );
    script.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
    document.head.appendChild(script);
  });
}

function ensureStylesheet(id: string, href: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve();

  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => reject(new Error(`Failed to load stylesheet: ${href}`)), { once: true });
    document.head.appendChild(link);
  });
}

function ensureYouTubeApiReady(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    let settled = false;
    const finishResolve = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const finishReject = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };

    const timeoutId = window.setTimeout(() => {
      if (window.YT?.Player) {
        finishResolve();
        return;
      }
      finishReject(new Error('YouTube Iframe API load timeout'));
    }, 15000);

    const previousReadyCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReadyCallback?.();
      window.clearTimeout(timeoutId);
      finishResolve();
    };

    void ensureScript('cs-player-yt-iframe-api', YT_IFRAME_API_URL)
      .then(() => {
        if (window.YT?.Player) {
          window.clearTimeout(timeoutId);
          finishResolve();
        }
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        finishReject(error instanceof Error ? error : new Error('Failed to load YouTube Iframe API'));
      });
  }).catch((error) => {
    youtubeApiPromise = null;
    throw error;
  });

  return youtubeApiPromise;
}

function ensureCsPlayerAssets(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.csPlayer) return Promise.resolve();
  if (csPlayerAssetsPromise) return csPlayerAssetsPromise;

  csPlayerAssetsPromise = Promise.all([
    ensureStylesheet('cs-player-style', CS_PLAYER_STYLE_URL),
    ensureScript('cs-player-script', CS_PLAYER_SCRIPT_URL),
  ])
    .then(() => {
      if (!window.csPlayer) throw new Error('csPlayer did not initialize');
    })
    .catch((error) => {
      csPlayerAssetsPromise = null;
      throw error;
    });

  return csPlayerAssetsPromise;
}

type CsPlayerEmbedProps = {
  videoId?: string | null;
  videoUrl?: string;
  autoplay?: boolean;
  className?: string;
  emptyMessage?: string;
  strictYouTube?: boolean;
  forceNative?: boolean;
  onEnded?: () => void;
  onStateChange?: (state: string) => void;
};

const CsPlayerEmbed: React.FC<CsPlayerEmbedProps> = ({
  videoId,
  videoUrl,
  autoplay = false,
  className = 'w-full aspect-video',
  emptyMessage = 'Video tapilmadi.',
  strictYouTube = false,
  forceNative = false,
  onEnded,
  onStateChange,
}) => {
  const resolvedVideoUrl = useMemo(() => String(videoUrl || '').trim(), [videoUrl]);
  const resolvedVideoId = useMemo(() => videoId || getYouTubeVideoId(resolvedVideoUrl), [videoId, resolvedVideoUrl]);
  const hostIdRef = useRef(`cs-player-${Math.random().toString(36).slice(2, 10)}`);
  const [csPlayerFailed, setCsPlayerFailed] = useState(false);

  useEffect(() => {
    setCsPlayerFailed(false);
  }, [resolvedVideoId, resolvedVideoUrl]);

  useEffect(() => {
    if (!resolvedVideoId || csPlayerFailed) return;

    let cancelled = false;
    let statePollInterval: number | undefined;
    let endedEventSent = false;
    let lastState = '';

    const initialize = async () => {
      try {
        await ensureYouTubeApiReady();
        await ensureCsPlayerAssets();
        if (cancelled) return;

        const api = window.csPlayer;
        if (!api) throw new Error('csPlayer API is unavailable');

        const host = document.getElementById(hostIdRef.current);
        if (!host) return;

        try {
          api.destroy(hostIdRef.current);
        } catch {
          // Ignore destroy failures when player is not initialized yet.
        }
        host.innerHTML = '';

        await api.init(hostIdRef.current, {
          defaultId: resolvedVideoId,
          thumbnail: true,
          theme: 'youtube',
          loop: false,
        });
        applyCsPlayerBrandTheme(host);

        if (autoplay) {
          window.setTimeout(() => {
            try {
              api.play(hostIdRef.current);
            } catch {
              // play() may fail before first user interaction in some browsers.
            }
          }, 300);
        }

        if (onEnded || onStateChange) {
          statePollInterval = window.setInterval(() => {
            try {
              const state = api.getPlayerState(hostIdRef.current);
              if (state !== lastState) {
                lastState = state;
                onStateChange?.(state);
              }
              if (state === 'ended' && !endedEventSent) {
                endedEventSent = true;
                onEnded();
                return;
              }
              if (state !== 'ended') endedEventSent = false;
            } catch {
              // Ignore intermittent player state errors.
            }
          }, 700);
        }
      } catch (error) {
        console.error('csPlayer initialization failed', error);
        if (!cancelled) setCsPlayerFailed(true);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      if (statePollInterval) window.clearInterval(statePollInterval);
      try {
        window.csPlayer?.destroy(hostIdRef.current);
      } catch {
        // Ignore destroy failures during unmount.
      }
    };
  }, [resolvedVideoId, autoplay, onEnded, onStateChange, csPlayerFailed]);

  if (resolvedVideoId && forceNative) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: '0',
      disablekb: '1',
      fs: '0',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3',
    });

    return (
      <iframe
        className={className}
        src={`https://www.youtube.com/embed/${resolvedVideoId}?${params.toString()}`}
        title="Video player"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (resolvedVideoId && !csPlayerFailed) {
    return (
      <div className={className}>
        <div id={hostIdRef.current} className="w-full h-full" />
      </div>
    );
  }

  if (resolvedVideoId && csPlayerFailed) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      controls: '0',
      disablekb: '1',
      fs: '0',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3',
    });

    return (
      <iframe
        className={className}
        src={`https://www.youtube.com/embed/${resolvedVideoId}?${params.toString()}`}
        title="Video player"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (resolvedVideoUrl && !strictYouTube) {
    return (
      <video className={className} controls autoPlay={autoplay} playsInline src={resolvedVideoUrl} preload="metadata" onEnded={onEnded} />
    );
  }

  return (
    <div className={`${className} bg-slate-900 flex items-center justify-center text-slate-300 text-sm font-bold`}>
      {emptyMessage}
    </div>
  );
};

export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const input = String(url).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const parsed = new URL(input);
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
    const match = input.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export default CsPlayerEmbed;
