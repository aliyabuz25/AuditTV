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

async function fetchSitemap(): Promise<Sitemap> {
  const response = await fetch(SITEMAP_ENDPOINT);
  if (!response.ok) {
    throw new Error(`Sitemap fetch failed: ${response.status}`);
  }
  const payload = await response.json();
  const remote = payload?.sitemap || payload;
  return {
    ...defaultSitemap,
    ...(remote || {}),
    settings: {
      ...defaultSitemap.settings,
      ...((remote || {}).settings || {}),
      seo: {
        ...defaultSitemap.settings.seo,
        ...((remote || {}).settings?.seo || {}),
      },
      smtp: {
        ...defaultSitemap.settings.smtp,
        ...((remote || {}).settings?.smtp || {}),
      },
      branding: {
        ...defaultSitemap.settings.branding,
        ...((remote || {}).settings?.branding || {}),
      },
      footer: {
        ...defaultSitemap.settings.footer,
        ...((remote || {}).settings?.footer || {}),
      },
    },
  };
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
    try {
      const response = await fetch(SITEMAP_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sitemap: next }),
      });

      if (!response.ok) {
        throw new Error(`Sitemap save failed: ${response.status}`);
      }

      setSitemap(next);
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
