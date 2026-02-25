import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  Cpu,
  Database,
  FileCheck,
  FileText,
  Globe,
  Headphones,
  Lightbulb,
  Mail,
  MessagesSquare,
  Mic,
  Navigation,
  Phone,
  PieChart,
  Plus,
  Search,
  Rocket,
  Save,
  Shield,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
  ChevronDown,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSiteData } from '../../site/SiteDataContext';
import { Sitemap } from '../../site/defaultSitemap';
import ImageWithPlaceholder from '../../components/ImageWithPlaceholder';

type PathPart = string | number;
type Path = PathPart[];

const SECTION_ORDER: Array<keyof Sitemap> = [
  'home',
  'about',
  'podcast',
  'blog',
  'education',
  'faq',
  'contact',
  'privacyPolicy',
  'termsOfUse',
  'navLinks',
  'settings',
  'topics',
  'services',
  'clients',
];

const EXCLUDED_SECTION_KEYS = new Set(['financialFacts', 'testimonials']);

const SECTION_META: Record<string, { label: string; Icon: LucideIcon }> = {
  home: { label: 'Ana Səhifə', Icon: Database },
  about: { label: 'Haqqımızda', Icon: Users },
  podcast: { label: 'Podkast', Icon: Mic },
  blog: { label: 'Bloq', Icon: FileText },
  education: { label: 'Tədris', Icon: BookOpen },
  faq: { label: 'Tez-tez Suallar', Icon: MessagesSquare },
  contact: { label: 'Əlaqə', Icon: Phone },
  privacyPolicy: { label: 'Məxfilik Siyasəti', Icon: Shield },
  termsOfUse: { label: 'İstifadə Şərtləri', Icon: FileText },
  navLinks: { label: 'Naviqasiya', Icon: Navigation },
  settings: { label: 'Sistem Ayarları', Icon: Database },
  topics: { label: 'Mövzular', Icon: Database },
  services: { label: 'Xidmətlər', Icon: Briefcase },
  clients: { label: 'Tərəfdaşlar', Icon: Building2 },
};

const ICON_OPTIONS: Array<{ key: string; Icon: LucideIcon }> = [
  { key: 'Briefcase', Icon: Briefcase },
  { key: 'Calculator', Icon: Calculator },
  { key: 'PieChart', Icon: PieChart },
  { key: 'UserCheck', Icon: UserCheck },
  { key: 'ShieldCheck', Icon: ShieldCheck },
  { key: 'TrendingUp', Icon: TrendingUp },
  { key: 'FileText', Icon: FileText },
  { key: 'Users', Icon: Users },
  { key: 'Lightbulb', Icon: Lightbulb },
  { key: 'AlertCircle', Icon: AlertCircle },
  { key: 'Cpu', Icon: Cpu },
  { key: 'Target', Icon: Target },
  { key: 'Globe', Icon: Globe },
  { key: 'Award', Icon: Award },
  { key: 'Shield', Icon: Shield },
  { key: 'Zap', Icon: Zap },
  { key: 'Rocket', Icon: Rocket },
  { key: 'BarChart3', Icon: BarChart3 },
  { key: 'Mic', Icon: Mic },
  { key: 'Headphones', Icon: Headphones },
  { key: 'Mail', Icon: Mail },
  { key: 'FileCheck', Icon: FileCheck },
  { key: 'CheckCircle2', Icon: CheckCircle2 },
];

const labelize = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (s) => s.toUpperCase());

const getAtPath = (obj: unknown, path: Path): unknown => {
  if (!path.length) return obj;
  const [head, ...rest] = path;
  if (obj == null) return undefined;
  return getAtPath((obj as Record<string, unknown>)[head as string], rest);
};

const setAtPath = (obj: unknown, path: Path, value: unknown): unknown => {
  if (!path.length) return value;
  const [head, ...rest] = path;

  if (Array.isArray(obj)) {
    const next = [...obj];
    const index = Number(head);
    next[index] = setAtPath(next[index], rest, value);
    return next;
  }

  const source = (obj as Record<string, unknown>) || {};
  return {
    ...source,
    [head]: setAtPath(source[head as string], rest, value),
  };
};

const createTemplateValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.length > 0 ? createTemplateValue(value[0]) : '';
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const entries = Object.keys(obj).map((key) => [key, createTemplateValue(obj[key])]);
    return Object.fromEntries(entries);
  }
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  return '';
};

const isIconField = (path: Path) => {
  const key = String(path[path.length - 1] || '').toLowerCase();
  return key === 'icon' || key === 'iconname';
};
const isFactsArrayPath = (path: Path) => String(path[path.length - 1] || '').toLowerCase() === 'facts';

const isSectionKey = (value: string): value is keyof Sitemap => SECTION_ORDER.includes(value as keyof Sitemap);
const pathToKey = (path: Path) => path.join('.');
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const isUploadableField = (path: Path) => {
  const key = String(path[path.length - 1] || '').toLowerCase();
  return (
    key.includes('url') ||
    key.includes('image') ||
    key.includes('thumbnail') ||
    key.includes('logo') ||
    key.includes('avatar') ||
    key === 'file'
  );
};
const isImageUrlField = (path: Path) => {
  const key = String(path[path.length - 1] || '').toLowerCase();
  return key.includes('image') || key.includes('thumbnail') || key.includes('logo') || key.includes('avatar');
};
const isLinkUrlField = (path: Path) => {
  const key = String(path[path.length - 1] || '').toLowerCase();
  if (!key.includes('url') && !key.includes('link')) return false;
  if (key === 'fileurl') return false;
  if (key.includes('image') || key.includes('thumbnail') || key.includes('logo') || key.includes('avatar')) return false;
  return true;
};
const cleanLabel = (title: string, path: Path) => {
  const key = String(path[path.length - 1] || '').toLowerCase();
  if (key === 'content') return 'Mətn';
  if (key === 'excerpt') return 'Qısa mətn';
  if (key.includes('image') || key.includes('thumbnail') || key.includes('logo') || key.includes('avatar')) return 'Şəkil';
  if (key === 'fileurl') return 'Fayl';
  if (key.includes('url') || key.includes('link')) return 'Link URL';
  return title;
};
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
const compactText = (value: string, max = 64) => {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
};
const summarizeArrayItem = (item: unknown) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return '';
  const rec = item as Record<string, unknown>;
  const candidates = ['title', 'name', 'text', 'label', 'role', 'number', 'date', 'duration', 'host', 'id'];
  const parts = candidates
    .map((k) => compactText(String(rec[k] || '')))
    .filter(Boolean)
    .slice(0, 2);
  return parts.join(' • ');
};
const isEmptyLeaf = (value: unknown) => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  return false;
};
const shouldHideField = (draft: Sitemap, path: Path) => {
  const last = String(path[path.length - 1] || '').toLowerCase();
  if (last !== 'name' || path[0] !== 'clients') return false;
  const parent = path.length > 1 ? getAtPath(draft, path.slice(0, -1)) : null;
  if (!parent || typeof parent !== 'object') return false;
  const logo = String((parent as Record<string, unknown>).logoUrl || '');
  return Boolean(logo.trim());
};
const asCanonicalBase = (value: string) => {
  const v = String(value || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v.replace(/\/+$/, '');
  return `https://${v.replace(/^\/+/, '').replace(/\/+$/, '')}`;
};
const normalizeToFullUrl = (input: string, base: string) => {
  const value = String(input || '').trim();
  if (!value) return '';
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (value.startsWith('/')) return base ? `${base}${value}` : `https://example.com${value}`;
  if (value.startsWith('#')) return base ? `${base}/${value}` : `https://example.com/${value}`;
  return `https://${value.replace(/^\/+/, '')}`;
};

const ContentManager: React.FC = () => {
  const { sitemap, saveSitemap, reload } = useSiteData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState<Sitemap>(sitemap);
  const initialSection = searchParams.get('section');
  const [activeTab, setActiveTab] = useState<keyof Sitemap>(isSectionKey(initialSection || '') ? initialSection : 'home');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  const [showOnlyEmpty, setShowOnlyEmpty] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [uploadingPath, setUploadingPath] = useState<Record<string, boolean>>({});
  const canonicalBase = useMemo(() => asCanonicalBase(draft.settings?.seo?.canonicalUrl || ''), [draft.settings?.seo?.canonicalUrl]);

  useEffect(() => {
    setDraft(sitemap);
  }, [sitemap]);

  const availableTabs = useMemo(() => {
    const keys = (Object.keys(draft) as Array<keyof Sitemap>).filter((key) => !EXCLUDED_SECTION_KEYS.has(String(key)));
    const ordered = SECTION_ORDER.filter((key) => keys.includes(key));
    const rest = keys.filter((key) => !ordered.includes(key));
    return [...ordered, ...rest];
  }, [draft]);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'home');
    }
  }, [activeTab, availableTabs]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && isSectionKey(section) && availableTabs.includes(section)) {
      setActiveTab(section);
      return;
    }
    const fallback = availableTabs.includes('home') ? 'home' : availableTabs[0];
    if (fallback) {
      setActiveTab(fallback);
      setSearchParams({ section: fallback });
    }
  }, [availableTabs, searchParams, setSearchParams]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(sitemap), [draft, sitemap]);
  const normalizedQuery = query.trim().toLowerCase();

  const isPathChanged = (path: Path) => {
    const now = getAtPath(draft, path);
    const base = getAtPath(sitemap, path);
    return JSON.stringify(now) !== JSON.stringify(base);
  };

  const collectCollapsiblePaths = (path: Path, value: unknown): string[] => {
    if (!value || typeof value !== 'object') return [];
    const current = [pathToKey(path)];
    if (Array.isArray(value)) {
      return [...current, ...value.flatMap((item, idx) => collectCollapsiblePaths([...path, idx], item))];
    }
    const entries = Object.entries(value as Record<string, unknown>);
    return [...current, ...entries.flatMap(([k, v]) => collectCollapsiblePaths([...path, k], v))];
  };

  const nodeMatchesQuery = (path: Path, value: unknown, title: string): boolean => {
    if (!normalizedQuery) return true;
    if (title.toLowerCase().includes(normalizedQuery)) return true;

    if (value == null) return false;
    if (typeof value !== 'object') return String(value).toLowerCase().includes(normalizedQuery);

    if (Array.isArray(value)) {
      return value.some((item, idx) => nodeMatchesQuery([...path, idx], item, `Sətir ${idx + 1}`));
    }

    return Object.entries(value as Record<string, unknown>).some(([k, v]) =>
      nodeMatchesQuery([...path, k], v, labelize(k)),
    );
  };

  const nodeHasChangedDeep = (path: Path, value: unknown): boolean => {
    if (value == null || typeof value !== 'object') return isPathChanged(path);
    if (Array.isArray(value)) return value.some((item, idx) => nodeHasChangedDeep([...path, idx], item));
    return Object.entries(value as Record<string, unknown>).some(([k, v]) => nodeHasChangedDeep([...path, k], v));
  };
  const nodeHasEmptyDeep = (path: Path, value: unknown): boolean => {
    if (value == null || typeof value !== 'object') return isEmptyLeaf(getAtPath(draft, path));
    if (Array.isArray(value)) return value.some((item, idx) => nodeHasEmptyDeep([...path, idx], item));
    return Object.entries(value as Record<string, unknown>).some(([k, v]) => nodeHasEmptyDeep([...path, k], v));
  };

  const updateValue = (path: Path, value: unknown) => {
    setSaved(false);
    setDraft((prev) => setAtPath(prev, path, value) as Sitemap);
  };

  const removeArrayItem = (arrayPath: Path, index: number) => {
    const current = getAtPath(draft, arrayPath);
    if (!Array.isArray(current)) return;
    const next = current.filter((_, i) => i !== index);
    updateValue(arrayPath, next);
  };

  const addArrayItem = (arrayPath: Path) => {
    const current = getAtPath(draft, arrayPath);
    if (!Array.isArray(current)) return;
    const template = current.length > 0 ? createTemplateValue(current[0]) : '';
    updateValue(arrayPath, [...current, template]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    const normalizeLinksDeep = (node: unknown, path: Path = []): unknown => {
      if (typeof node === 'string') {
        return isLinkUrlField(path) ? normalizeToFullUrl(node, canonicalBase) : node;
      }
      if (Array.isArray(node)) {
        return node.map((item, idx) => normalizeLinksDeep(item, [...path, idx]));
      }
      if (node && typeof node === 'object') {
        const next: Record<string, unknown> = {};
        Object.entries(node as Record<string, unknown>).forEach(([k, v]) => {
          next[k] = normalizeLinksDeep(v, [...path, k]);
        });
        return next;
      }
      return node;
    };
    const normalizedDraft = normalizeLinksDeep(draft) as Sitemap;
    setDraft(normalizedDraft);
    const ok = await saveSitemap(normalizedDraft);
    setSaving(false);
    if (!ok) {
      setError('Saxlama zamanı xəta baş verdi.');
      return;
    }
    await reload();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isSave = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';
      if (!isSave) return;
      e.preventDefault();
      if (!saving && dirty) {
        void handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dirty, saving, draft]);

  const handleReset = () => {
    setDraft(sitemap);
    setSaved(false);
    setError('');
  };

  const getStringForEditor = (path: Path, raw: string) => {
    const key = String(path[path.length - 1] || '').toLowerCase();
    const parent = path.length > 1 ? getAtPath(draft, path.slice(0, -1)) : null;

    if (key === 'content' && parent && typeof parent === 'object') {
      const blockType = String((parent as Record<string, unknown>).type || '').toLowerCase();
      if (blockType === 'list') {
        const items = [...raw.matchAll(/<li>(.*?)<\/li>/gi)].map((m) => stripHtml(m[1] || ''));
        if (items.length) return items.join('\n');
      }
    }

    return raw.includes('<') && raw.includes('>') ? stripHtml(raw) : raw;
  };

  const getStoredFromEditor = (path: Path, text: string) => {
    const key = String(path[path.length - 1] || '').toLowerCase();
    const parent = path.length > 1 ? getAtPath(draft, path.slice(0, -1)) : null;
    if (key === 'content' && parent && typeof parent === 'object') {
      const blockType = String((parent as Record<string, unknown>).type || '').toLowerCase();
      if (blockType === 'list') {
        return text
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `<li>${line}</li>`)
          .join('');
      }
    }
    return text;
  };

  const uploadToPath = async (path: Path, file: File) => {
    const key = pathToKey(path);
    setUploadingPath((prev) => ({ ...prev, [key]: true }));
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Fayl yükləmə xətası');
      }
      const payload = await response.json();
      updateValue(path, String(payload.url || ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fayl yükləmə xətası');
    } finally {
      setUploadingPath((prev) => ({ ...prev, [key]: false }));
    }
  };

  const renderIconPicker = (path: Path, value: string, title: string) => {
    const pickerKey = `__icon.${pathToKey(path)}`;
    const pickerOpen = !!collapsed[pickerKey];
    const CurrentIcon = ICON_OPTIONS.find((it) => it.key === value)?.Icon;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</span>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => ({ ...prev, [pickerKey]: !prev[pickerKey] }))}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest"
          >
            {pickerOpen ? 'İkonları Gizlət' : 'İkon Seç'}
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2.5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              {CurrentIcon ? <CurrentIcon size={20} /> : <AlertCircle size={20} />}
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => updateValue(path, e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800"
              placeholder="İkon adı"
            />
          </div>
          {pickerOpen ? (
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateValue(path, key)}
                  className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                    value === key ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                  title={key}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const renderField = (path: Path, value: unknown, keyLabel?: string): React.ReactNode => {
    if (shouldHideField(draft, path)) return null;
    const key = pathToKey(path);
    const part = path[path.length - 1];
    const fallbackLabel = typeof part === 'number' ? `Sətir ${part + 1}` : labelize(String(part ?? 'Field'));
    const title = cleanLabel(keyLabel || fallbackLabel, path);
    if (!nodeMatchesQuery(path, value, title)) return null;
    if (showOnlyChanged && !nodeHasChangedDeep(path, value)) return null;
    if (showOnlyEmpty && !nodeHasEmptyDeep(path, value)) return null;
    const changed = isPathChanged(path);

    if (Array.isArray(value)) {
      if (isFactsArrayPath(path)) {
        const isCollapsed = !!collapsed[key] && !normalizedQuery;
        const hasAnyId = value.some((item) => item && typeof item === 'object' && !Array.isArray(item) && 'id' in (item as Record<string, unknown>));
        const moveFact = (index: number, direction: -1 | 1) => {
          const target = index + direction;
          if (target < 0 || target >= value.length) return;
          const next = [...value];
          [next[index], next[target]] = [next[target], next[index]];
          updateValue(path, next);
        };
        const duplicateFact = (index: number) => {
          const row = value[index];
          if (!row || typeof row !== 'object' || Array.isArray(row)) return;
          const clone = { ...(row as Record<string, unknown>) };
          const next = [...value.slice(0, index + 1), clone, ...value.slice(index + 1)];
          updateValue(path, next);
        };

        return (
          <div key={key} className={`bg-slate-50 border rounded-xl p-3 space-y-2.5 ${changed ? 'border-primary-200' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600"
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                {title}
                <span className="text-[10px] font-bold normal-case tracking-normal text-slate-500">({value.length})</span>
                {changed ? <span className="px-2 py-0.5 rounded-full text-[9px] bg-primary-100 text-primary-700">Dəyişib</span> : null}
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextId = hasAnyId
                    ? Math.max(
                        0,
                        ...value.map((item) => {
                          const id = Number((item as Record<string, unknown>)?.id);
                          return Number.isFinite(id) ? id : 0;
                        }),
                      ) + 1
                    : undefined;
                  const next = hasAnyId ? { id: nextId, text: 'Yeni fakt...', icon: 'Lightbulb' } : { text: 'Yeni fakt...', icon: 'Lightbulb' };
                  updateValue(path, [...value, next]);
                }}
                className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
              >
                <Plus size={12} /> Əlavə Et
              </button>
            </div>

            <div className={`space-y-3 ${isCollapsed ? 'hidden' : ''}`}>
              {value.length === 0 ? (
                <div className="text-xs font-medium text-slate-400">Fakt yoxdur.</div>
              ) : (
                value.map((item, index) => {
                  const row = item && typeof item === 'object' && !Array.isArray(item) ? (item as Record<string, unknown>) : {};
                  const iconValue = String(row.icon || 'Lightbulb');
                  const textValue = String(row.text || '');
                  const IconCmp = ICON_OPTIONS.find((it) => it.key === iconValue)?.Icon || Lightbulb;

                  return (
                    <div key={`${key}.${index}`} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sətir {index + 1}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveFact(index, -1)}
                            disabled={index === 0}
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFact(index, 1)}
                            disabled={index === value.length - 1}
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateFact(index)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeArrayItem(path, index)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <span className="text-xs font-black text-slate-500">Text</span>
                          <textarea
                            rows={3}
                            value={textValue}
                            onChange={(e) => updateValue([...path, index, 'text'], e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 font-medium text-slate-800"
                          />
                        </div>
                        <div className="space-y-2">
                          {renderIconPicker([...path, index, 'icon'], iconValue, 'Icon')}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <IconCmp size={66} />
                        </div>
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-2.5">
                          <IconCmp size={22} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                          {textValue || 'Fakt mətni daxil edin...'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }

      const isCollapsed = !!collapsed[key] && !normalizedQuery;
      return (
        <div key={key} className={`bg-slate-50 border rounded-xl p-3 space-y-2.5 ${changed ? 'border-primary-200' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              {title}
              {changed ? <span className="px-2 py-0.5 rounded-full text-[9px] bg-primary-100 text-primary-700">Dəyişib</span> : null}
            </button>
            <button
              type="button"
              onClick={() => addArrayItem(path)}
              className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
            >
              <Plus size={12} /> Əlavə Et
            </button>
          </div>
          <div className={`space-y-3 ${isCollapsed ? 'hidden' : ''}`}>
            {value.length === 0 ? (
              <div className="text-xs font-medium text-slate-400">Boş siyahıdır.</div>
            ) : (
              value.map((item, index) => (
                <div key={`${key}.${index}`} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2">
                  {(() => {
                    const rowKey = `__row.${key}.${index}`;
                    const rowCollapsed = !!collapsed[rowKey] && !normalizedQuery;
                    return (
                  <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setCollapsed((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }))}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"
                        >
                          {rowCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                          <span>
                            Sətir {index + 1}
                            {summarizeArrayItem(item) ? (
                              <span className="ml-2 normal-case tracking-normal text-slate-500 font-bold">
                                {summarizeArrayItem(item)}
                              </span>
                            ) : null}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeArrayItem(path, index)}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })()}
                  <div className={!!collapsed[`__row.${key}.${index}`] && !normalizedQuery ? 'hidden' : ''}>
                    {item && typeof item === 'object' && !Array.isArray(item) ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(item as Record<string, unknown>).map(([childKey, childValue]) => (
                          <div key={`${key}.${index}.${childKey}`} className={childValue && typeof childValue === 'object' ? 'md:col-span-2' : ''}>
                            {renderField([...path, index, childKey], childValue, labelize(childKey))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      renderField([...path, index], item)
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      const isCollapsed = !!collapsed[key] && !normalizedQuery;
      return (
        <div key={key} className={`bg-white border rounded-xl p-3 space-y-2.5 ${changed ? 'border-primary-200' : 'border-slate-200'}`}>
          <button
            type="button"
            onClick={() => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
            className="w-full text-left flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            {title}
            {changed ? <span className="px-2 py-0.5 rounded-full text-[9px] bg-primary-100 text-primary-700">Dəyişib</span> : null}
          </button>
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${isCollapsed ? 'hidden' : ''}`}>
            {entries.map(([childKey, childValue]) => (
              <div key={`${key}.${childKey}`} className={childValue && typeof childValue === 'object' ? 'md:col-span-2' : ''}>
                {renderField([...path, childKey], childValue, labelize(childKey))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <label key={key} className={`flex items-center justify-between gap-4 bg-white border rounded-lg px-3 py-2.5 ${changed ? 'border-primary-200' : 'border-slate-200'}`}>
          <span className="text-sm font-bold text-slate-700">{title}</span>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateValue(path, e.target.checked)}
            className="h-4 w-4"
          />
        </label>
      );
    }

    if (typeof value === 'number') {
      return (
        <label key={key} className="block space-y-2">
          <span className="text-xs font-black text-slate-500">{title}</span>
          <input
            type="number"
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => updateValue(path, Number(e.target.value || 0))}
            className={`w-full bg-white border rounded-lg px-3 py-2.5 font-medium text-slate-800 ${changed ? 'border-primary-200' : 'border-slate-200'}`}
          />
        </label>
      );
    }

    const rawValue = typeof value === 'string' ? value : String(value ?? '');
    const strValue = getStringForEditor(path, rawValue);
    const fieldKey = pathToKey(path);
    const isUploading = !!uploadingPath[fieldKey];
    const uploadAllowed = activeTab !== 'blog';
    const linkField = isLinkUrlField(path);
    if (isIconField(path)) {
      return (
        <div key={key}>
          {renderIconPicker(path, strValue, title)}
        </div>
      );
    }

    const isLong = strValue.length > 120 || strValue.includes('\n');

    const imageField = isImageUrlField(path);
    return (
      <div key={key} className="block space-y-2">
        <span className="text-xs font-black text-slate-500 flex items-center justify-between gap-2">
          <span>{title}</span>
          {isUploadableField(path) && uploadAllowed ? (
            <label className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest cursor-pointer">
              {isUploading ? 'Yüklənir...' : (imageField ? 'Yeni Yüklə' : 'Fayl Yüklə')}
              <input
                type="file"
                accept={imageField ? 'image/*' : 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv'}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadToPath(path, file);
                  if (e.target) e.target.value = '';
                }}
              />
            </label>
          ) : null}
        </span>
        {imageField ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <div className="w-full h-40 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
              <ImageWithPlaceholder
                src={strValue}
                alt={title}
                className="w-full h-full object-cover"
                placeholderText="Görsel seçilməyib"
              />
            </div>
          </div>
        ) : null}
        {isLong ? (
          <textarea
            rows={4}
            value={strValue}
            onChange={(e) => updateValue(path, getStoredFromEditor(path, e.target.value))}
            className={`w-full bg-white border rounded-lg px-3 py-2.5 font-medium text-slate-800 ${changed ? 'border-primary-200' : 'border-slate-200'}`}
          />
        ) : (
          <div className="flex gap-2">
            <input
              type={linkField ? 'url' : 'text'}
              value={strValue}
              onChange={(e) => updateValue(path, getStoredFromEditor(path, e.target.value))}
              onBlur={(e) => {
                if (!linkField) return;
                updateValue(path, normalizeToFullUrl(e.target.value, canonicalBase));
              }}
              placeholder={linkField ? 'https://example.com/səhifə' : ''}
              className={`w-full bg-white border rounded-lg px-3 py-2.5 font-medium text-slate-800 ${changed ? 'border-primary-200' : 'border-slate-200'}`}
            />
            {linkField && strValue ? (
              <a
                href={normalizeToFullUrl(strValue, canonicalBase)}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest whitespace-nowrap"
              >
                Aç
              </a>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  const renderSettingsSection = (): React.ReactNode => {
    const renderSettingField = (path: Path, label: string, wide = false) => {
      const node = renderField(path, getAtPath(draft, path), label);
      if (!node) return null;
      return <div className={wide ? 'md:col-span-2' : ''}>{node}</div>;
    };

    const renderCard = (title: string, Icon: LucideIcon, nodes: React.ReactNode[]) => {
      const visibleNodes = nodes.filter(Boolean);
      if (!visibleNodes.length) return null;
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Icon size={17} className="text-primary-600" />
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">{title}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{visibleNodes}</div>
        </div>
      );
    };

    const seoCard = renderCard('SEO', Globe, [
      renderSettingField(['settings', 'seo', 'title'], 'Title'),
      renderSettingField(['settings', 'seo', 'description'], 'Description'),
      renderSettingField(['settings', 'seo', 'keywords'], 'Keywords'),
      renderSettingField(['settings', 'seo', 'canonicalUrl'], 'Canonical URL'),
    ]);

    const smtpCard = renderCard('SMTP', Mail, [
      renderSettingField(['settings', 'smtp', 'host'], 'Host'),
      renderSettingField(['settings', 'smtp', 'port'], 'Port'),
      renderSettingField(['settings', 'smtp', 'username'], 'Username'),
      renderSettingField(['settings', 'smtp', 'password'], 'Password'),
      renderSettingField(['settings', 'smtp', 'secure'], 'Secure'),
      renderSettingField(['settings', 'smtp', 'fromEmail'], 'From Email'),
      renderSettingField(['settings', 'smtp', 'fromName'], 'From Name'),
      renderSettingField(['settings', 'smtp', 'notifyEmails'], 'Notify Emails'),
    ]);

    const brandingCard = renderCard('Branding', Award, [
      renderSettingField(['settings', 'branding', 'logoUrl'], 'Logo URL'),
      renderSettingField(['settings', 'branding', 'siteName'], 'Site Name'),
    ]);

    const footerCard = renderCard('Footer', FileText, [
      renderSettingField(['settings', 'footer', 'aboutText'], 'About Text', true),
      renderSettingField(['settings', 'footer', 'platformTitle'], 'Platform Title'),
      renderSettingField(['settings', 'footer', 'resourcesTitle'], 'Resources Title'),
      renderSettingField(['settings', 'footer', 'contactTitle'], 'Contact Title'),
      renderSettingField(['settings', 'footer', 'address'], 'Address'),
      renderSettingField(['settings', 'footer', 'phone'], 'Phone'),
      renderSettingField(['settings', 'footer', 'email'], 'Email'),
      renderSettingField(['settings', 'footer', 'platformLinks'], 'Platform Linkləri', true),
      renderSettingField(['settings', 'footer', 'resourceLinks'], 'Resurs Linkləri', true),
      renderSettingField(['settings', 'footer', 'socialLinks', 'linkedin'], 'Linkedin'),
      renderSettingField(['settings', 'footer', 'socialLinks', 'facebook'], 'Facebook'),
      renderSettingField(['settings', 'footer', 'socialLinks', 'twitter'], 'Twitter'),
      renderSettingField(['settings', 'footer', 'socialLinks', 'email'], 'Social Email'),
      renderSettingField(['settings', 'footer', 'copyrightText'], 'Copyright Text', true),
      renderSettingField(['settings', 'footer', 'privacyLabel'], 'Privacy Label'),
      renderSettingField(['settings', 'footer', 'privacyUrl'], 'Privacy URL'),
      renderSettingField(['settings', 'footer', 'termsLabel'], 'Terms Label'),
      renderSettingField(['settings', 'footer', 'termsUrl'], 'Terms URL'),
    ]);

    const cards = [seoCard, smtpCard, brandingCard, footerCard].filter(Boolean);
    if (!cards.length) return null;
    return <div className="space-y-3">{cards}</div>;
  };

  const activeSectionNode =
    activeTab === 'settings'
      ? renderSettingsSection()
      : renderField(
          [activeTab],
          (draft as Record<string, unknown>)[activeTab],
          SECTION_META[String(activeTab)]?.label || labelize(String(activeTab)),
        );

  return (
    <section className="space-y-4">
      {error ? <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm font-bold text-red-700">{error}</div> : null}
      {saved ? <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm font-bold text-emerald-700">Saxlanıldı.</div> : null}

      <div className="space-y-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="mb-3 pb-2.5 border-b border-slate-100 flex items-center gap-2">
            {SECTION_META[String(activeTab)]?.Icon ? React.createElement(SECTION_META[String(activeTab)].Icon, { size: 18, className: 'text-primary-600' }) : null}
            <h3 className="text-lg font-black text-slate-900">
              {SECTION_META[String(activeTab)]?.label || labelize(String(activeTab))}
            </h3>
            {isPathChanged([activeTab]) ? <span className="ml-2 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-100 text-primary-700">Dəyişiklik var</span> : null}
          </div>
          {activeTab === 'blog' ? (
          <div className="mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs font-bold text-amber-700">
              Bloq bölməsində yükləmə deaktivdir. Şəkil və media yükləməni `Bloq` səhifəsindən (`#/admin/blogs`) edin.
            </div>
          ) : null}

          <div className="mb-3 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] gap-2.5">
            <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sahə axtarışı (məs. title, email, hero...)"
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowOnlyEmpty((prev) => !prev)}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${
                showOnlyEmpty ? 'bg-amber-500 text-white shadow-sm shadow-amber-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {showOnlyEmpty ? 'Boşlar: Açıq' : 'Yalnız Boşlar'}
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyChanged((prev) => !prev)}
              className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest ${
                showOnlyChanged ? 'bg-primary-600 text-white shadow-sm shadow-primary-200' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {showOnlyChanged ? 'Dəyişənlər: Açıq' : 'Yalnız Dəyişənlər'}
            </button>
            <button
              type="button"
              onClick={() => setCollapsed({})}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest"
            >
              Hamısını Aç
            </button>
            <button
              type="button"
              onClick={() => {
                const next: Record<string, boolean> = {};
                collectCollapsiblePaths([activeTab], (draft as Record<string, unknown>)[activeTab]).forEach((p) => {
                  next[p] = true;
                });
                setCollapsed(next);
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest"
            >
              Hamısını Yığ
            </button>
          </div>

          <div className={activeTab === 'settings' ? 'space-y-3' : 'bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5'}>
            {activeSectionNode || (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center">
                <p className="text-sm font-bold text-slate-500">
                  {showOnlyChanged
                    ? 'Bu bölmədə dəyişdirilmiş sahə yoxdur.'
                    : showOnlyEmpty
                      ? 'Bu bölmədə boş sahə yoxdur.'
                      : 'Axtarışa uyğun sahə tapılmadı.'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button onClick={handleReset} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-widest">
              Dəyişiklikləri Sıfırla
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest shadow-sm shadow-primary-200 disabled:opacity-60 flex items-center gap-2"
          >
            <Save size={16} /> {saving ? 'Saxlanır...' : 'Hamısını Saxla'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContentManager;
