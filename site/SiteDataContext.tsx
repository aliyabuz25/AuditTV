import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultSitemap, Sitemap } from './defaultSitemap';

type SiteDataContextType = {
  sitemap: Sitemap;
  loading: boolean;
  error: string | null;
  saveSitemap: (next: Sitemap) => Promise<boolean>;
  saveSection: <K extends keyof Sitemap>(key: K, value: Sitemap[K]) => Promise<boolean>;
  reload: () => Promise<void>;
};

const SiteDataContext = createContext<SiteDataContextType | null>(null);

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const SITEMAP_ENDPOINT = `${API_BASE}/api/sitemap`;

const BROKEN_IMAGE_FRAGMENT = 'photo-1478737270239-2f02b77ac6d5';
const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1515378791036-0648a814c963?auto=format&fit=crop&q=80&w=1200';
const DEFAULT_FACT_ICON = 'Lightbulb';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeWithDefaults<T>(defaults: T, remote: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(remote) ? remote : defaults) as T;
  }

  if (isPlainObject(defaults)) {
    const remoteObj = isPlainObject(remote) ? remote : {};
    const merged: Record<string, unknown> = {};

    for (const key of Object.keys(defaults)) {
      merged[key] = mergeWithDefaults((defaults as Record<string, unknown>)[key], remoteObj[key]);
    }

    for (const [key, value] of Object.entries(remoteObj)) {
      if (!(key in merged)) {
        merged[key] = value;
      }
    }

    return merged as T;
  }

  if (remote === undefined || remote === null) {
    return defaults;
  }

  if (typeof defaults === 'string') {
    return (typeof remote === 'string' ? remote : defaults) as T;
  }

  if (typeof defaults === 'number') {
    return (typeof remote === 'number' && Number.isFinite(remote) ? remote : defaults) as T;
  }

  if (typeof defaults === 'boolean') {
    return (typeof remote === 'boolean' ? remote : defaults) as T;
  }

  return remote as T;
}

function sanitizeImageUrl(url: string): string {
  if (!url) return '';
  if (url.includes(BROKEN_IMAGE_FRAGMENT)) return FALLBACK_THUMBNAIL;
  return url;
}

function normalizeFacts(sitemap: Sitemap): Sitemap {
  const topFactsRaw = Array.isArray(sitemap.financialFacts) ? sitemap.financialFacts : [];
  const homeFactsRaw = Array.isArray(sitemap.home?.facts) ? sitemap.home.facts : [];

  const topFacts = topFactsRaw.map((fact, index) => ({
    id: Number((fact as { id?: number }).id) || index + 1,
    text: String((fact as { text?: string }).text || ''),
    icon: String((fact as { icon?: string }).icon || DEFAULT_FACT_ICON),
  }));

  const homeFacts = homeFactsRaw.map((fact) => ({
    text: String((fact as { text?: string }).text || ''),
    icon: String((fact as { icon?: string }).icon || DEFAULT_FACT_ICON),
  }));

  const mergedFacts =
    homeFacts.length >= topFacts.length && homeFacts.length > 0
      ? homeFacts
      : topFacts.map(({ text, icon }) => ({ text, icon }));

  return {
    ...sitemap,
    financialFacts: mergedFacts.map((fact, index) => ({
      id: index + 1,
      text: fact.text,
      icon: fact.icon,
    })),
    home: {
      ...sitemap.home,
      facts: mergedFacts,
    },
  };
}

function sanitizeSitemap(sitemap: Sitemap): Sitemap {
  const factsNormalized = normalizeFacts(sitemap);
  return {
    ...factsNormalized,
    blog: {
      ...factsNormalized.blog,
      posts: factsNormalized.blog.posts.map((post) => ({
        ...post,
        imageUrl: sanitizeImageUrl(String(post.imageUrl || '')),
      })),
    },
    podcast: {
      ...factsNormalized.podcast,
      episodes: factsNormalized.podcast.episodes.map((episode) => ({
        ...episode,
        thumbnailUrl: sanitizeImageUrl(String(episode.thumbnailUrl || '')),
      })),
    },
    education: {
      ...factsNormalized.education,
      courses: factsNormalized.education.courses.map((course) => ({
        ...course,
        thumbnailUrl: sanitizeImageUrl(String(course.thumbnailUrl || '')),
      })),
    },
  };
}

async function fetchSitemap(): Promise<Sitemap> {
  const response = await fetch(SITEMAP_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status}`);
  }
  const payload = await response.json();
  const remote = payload?.sitemap ?? payload;
  const merged = mergeWithDefaults(defaultSitemap, remote);
  return sanitizeSitemap(merged);
}

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sitemap, setSitemap] = useState<Sitemap>(defaultSitemap);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchSitemap();
      setSitemap(next as Sitemap);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sitemap could not be loaded');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveSitemap = useCallback(async (next: Sitemap) => {
    const normalized = sanitizeSitemap(next);
    try {
      const response = await fetch(SITEMAP_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemap: normalized }),
      });

      if (!response.ok) {
        throw new Error(`Sitemap save failed: ${response.status}`);
      }

      setSitemap(normalized);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sitemap could not be saved');
      return false;
    }
  }, []);

  const saveSection = useCallback(
    async <K extends keyof Sitemap>(key: K, value: Sitemap[K]) => {
      const next = { ...sitemap, [key]: value };
      return saveSitemap(next);
    },
    [saveSitemap, sitemap],
  );

  const contextValue = useMemo(
    () => ({ sitemap, loading, error, saveSitemap, saveSection, reload }),
    [error, loading, reload, saveSection, saveSitemap, sitemap],
  );

  return <SiteDataContext.Provider value={contextValue}>{children}</SiteDataContext.Provider>;
};

export function useSiteData(): SiteDataContextType {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within SiteDataProvider');
  }
  return context;
}
