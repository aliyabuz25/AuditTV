import React, { useEffect, useRef, useState } from 'react';
import {
  Save,
  Check,
  Search,
  Mail,
  Globe,
  Upload,
  Image as ImageIcon,
  Linkedin,
  Facebook,
  Twitter,
  AtSign,
  ExternalLink,
} from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const linksToText = (links: Array<{ label: string; path: string }>) =>
  links.map((l) => `${l.label}|${l.path}`).join('\n');

const textToLinks = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, path] = line.split('|');
      return { label: (label || '').trim(), path: (path || '').trim() };
    })
    .filter((l) => l.label && l.path);

const SeoSmtpManager: React.FC = () => {
  const { sitemap, saveSection } = useSiteData();
  const [saved, setSaved] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState(sitemap.settings);
  const [platformLinksText, setPlatformLinksText] = useState(linksToText(sitemap.settings.footer.platformLinks));
  const [resourceLinksText, setResourceLinksText] = useState(linksToText(sitemap.settings.footer.resourceLinks));

  useEffect(() => {
    setSettings(sitemap.settings);
    setPlatformLinksText(linksToText(sitemap.settings.footer.platformLinks));
    setResourceLinksText(linksToText(sitemap.settings.footer.resourceLinks));
  }, [sitemap.settings]);

  const handleSave = async () => {
    const ok = await saveSection('settings', settings);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  const uploadLogo = async (file: File) => {
    setLoadingUpload(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${API_BASE}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) return;
      const payload = await response.json();
      if (payload.url) {
        setSettings((prev) => ({
          ...prev,
          branding: { ...prev.branding, logoUrl: payload.url },
        }));
      }
    } finally {
      setLoadingUpload(false);
    }
  };

  return (
    <div className="space-y-10 pb-24">
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Footer Ayarları</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Meta, mail və branding idarəetməsi</p>
        </div>
        <button onClick={handleSave} className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95">
          {saved ? <Check size={18} /> : <Save size={18} />} {saved ? 'Saxlanıldı' : 'Yadda Saxla'}
        </button>
      </header>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Search size={14} className="text-primary-600" /> SEO</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Site Title</label>
            <input value={settings.seo.title} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, title: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Canonical URL</label>
            <input value={settings.seo.canonicalUrl} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, canonicalUrl: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meta Description</label>
          <textarea rows={3} value={settings.seo.description} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, description: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keywords (comma separated)</label>
          <input value={settings.seo.keywords} onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, keywords: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Mail size={14} className="text-primary-600" /> SMTP</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Host</label>
            <input value={settings.smtp.host} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, host: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Port</label>
            <input type="number" value={settings.smtp.port} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, port: Number(e.target.value || 0) } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</label>
            <input value={settings.smtp.username} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, username: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input type="password" value={settings.smtp.password} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, password: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From Email</label>
            <input value={settings.smtp.fromEmail} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, fromEmail: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From Name</label>
            <input value={settings.smtp.fromName} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, fromName: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
          <input type="checkbox" checked={settings.smtp.secure} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, secure: e.target.checked } })} />
          Secure (TLS/SSL)
        </label>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><ImageIcon size={14} className="text-primary-600" /> Site Logo</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="aspect-[4/2] bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
              {settings.branding.logoUrl ? (
                <img src={settings.branding.logoUrl} alt="Site logo" className="max-h-20 object-contain" />
              ) : (
                <div className="text-slate-400 text-sm font-bold">Logo yüklənməyib</div>
              )}
            </div>
            <input value={settings.branding.logoUrl} onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logoUrl: e.target.value } })} placeholder="Logo URL" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
          </div>

          <div className="space-y-4">
            <button onClick={() => fileInputRef.current?.click()} disabled={loadingUpload} className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              <Upload size={16} /> {loadingUpload ? 'Yüklənir...' : 'Logo Yüklə'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadLogo(file);
              }}
            />
            <input value={settings.branding.siteName} onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, siteName: e.target.value } })} placeholder="Site adı" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Globe size={14} className="text-primary-600" /> Footer Ayarları</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Site haqqında mətn</label>
            <textarea rows={3} value={settings.footer.aboutText} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, aboutText: e.target.value } })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <input value={settings.footer.platformTitle} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, platformTitle: e.target.value } })} placeholder="Platform başlığı" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
            <input value={settings.footer.resourcesTitle} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, resourcesTitle: e.target.value } })} placeholder="Resurslar başlığı" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
            <input value={settings.footer.contactTitle} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, contactTitle: e.target.value } })} placeholder="Əlaqə başlığı" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input value={settings.footer.address} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, address: e.target.value } })} placeholder="Ünvan" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          <input value={settings.footer.phone} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, phone: e.target.value } })} placeholder="Telefon" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          <input value={settings.footer.email} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, email: e.target.value } })} placeholder="Email" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Platforma linkləri (`Label|/path`)</label>
            <textarea
              rows={5}
              value={platformLinksText}
              onChange={(e) => {
                setPlatformLinksText(e.target.value);
                setSettings({ ...settings, footer: { ...settings.footer, platformLinks: textToLinks(e.target.value) } });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resurs linkləri (`Label|/path`)</label>
            <textarea
              rows={5}
              value={resourceLinksText}
              onChange={(e) => {
                setResourceLinksText(e.target.value);
                setSettings({ ...settings, footer: { ...settings.footer, resourceLinks: textToLinks(e.target.value) } });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Sosial şəbəkə linkləri</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Linkedin size={18} className="text-[#0A66C2]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 min-w-[84px]">LinkedIn</span>
              <input
                value={settings.footer.socialLinks.linkedin}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, linkedin: e.target.value } } })}
                placeholder="https://linkedin.com/company/..."
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Facebook size={18} className="text-[#1877F2]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 min-w-[84px]">Facebook</span>
              <input
                value={settings.footer.socialLinks.facebook}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, facebook: e.target.value } } })}
                placeholder="https://facebook.com/..."
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Twitter size={18} className="text-slate-700" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 min-w-[84px]">X / Twitter</span>
              <input
                value={settings.footer.socialLinks.twitter}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, twitter: e.target.value } } })}
                placeholder="https://x.com/..."
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <AtSign size={18} className="text-primary-600" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 min-w-[84px]">E-mail</span>
              <input
                value={settings.footer.socialLinks.email}
                onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, socialLinks: { ...settings.footer.socialLinks, email: e.target.value } } })}
                placeholder="mailto:info@audit.tv"
                className="w-full bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <input value={settings.footer.copyrightText} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyrightText: e.target.value } })} placeholder="Copyright mətni" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Hüquqi linklər</label>
            <div className="grid grid-cols-2 gap-3">
              <input value={settings.footer.privacyLabel} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, privacyLabel: e.target.value } })} placeholder="Məxfilik adı" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
              <div className="relative">
                <input value={settings.footer.privacyUrl} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, privacyUrl: e.target.value } })} placeholder="/mexfilik-siyaseti və ya tam URL" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium" />
                {settings.footer.privacyUrl ? (
                  <a href={settings.footer.privacyUrl} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600">
                    <ExternalLink size={16} />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-start-2">
            <input value={settings.footer.termsLabel} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, termsLabel: e.target.value } })} placeholder="Şərtlər adı" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
            <div className="relative">
              <input value={settings.footer.termsUrl} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, termsUrl: e.target.value } })} placeholder="/istifade-sertleri və ya tam URL" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 font-medium" />
              {settings.footer.termsUrl ? (
                <a href={settings.footer.termsUrl} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600">
                  <ExternalLink size={16} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeoSmtpManager;
