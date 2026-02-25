
import React, { useEffect, useRef, useState } from 'react';
import { 
  Save, Layout, Check, Plus, Trash2, 
  Download, Users, Lightbulb, 
  MessageSquare, Mail, Mic, FileText, Upload, BookOpen,
  ShieldCheck, Calculator, PieChart, UserCheck, Briefcase, Cpu, TrendingUp, AlertCircle, FileCheck, Headphones, HelpCircle,
  Copy, ExternalLink, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';

type UploadedPdf = {
  name: string;
  url: string;
  absoluteUrl?: string;
  size: number;
  uploadedAt: string;
};

const humanFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const ICON_OPTIONS = [
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
  { key: 'FileCheck', Icon: FileCheck }
];

const ICON_BY_KEY = Object.fromEntries(ICON_OPTIONS.map((item) => [item.key, item.Icon])) as Record<string, React.ComponentType<{ size?: number; className?: string }>>;

const IconPicker = ({ current, onSelect }: { current: string, onSelect: (key: string) => void }) => {
  return (
    <div className="grid grid-cols-6 gap-2 p-3 bg-white rounded-2xl border border-slate-200">
      {ICON_OPTIONS.map(({ key, Icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`p-3 rounded-xl flex items-center justify-center transition-all ${
            current === key ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
          title={key}
        >
          <Icon size={22} />
        </button>
      ))}
    </div>
  );
};

type DashboardFact = {
  text: string;
  icon: string;
};

const normalizeDashboardFacts = (value: unknown): DashboardFact[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      text: String(row.text || ''),
      icon: String(row.icon || 'Lightbulb'),
    };
  });
};

const resolveDashboardFacts = (data: { financialFacts?: unknown; home?: { facts?: unknown } }): DashboardFact[] => {
  const fromTopLevel = normalizeDashboardFacts(data.financialFacts);
  const fromHome = normalizeDashboardFacts(data.home?.facts);
  if (fromTopLevel.length >= fromHome.length && fromTopLevel.length > 0) return fromTopLevel;
  if (fromHome.length > 0) return fromHome;
  return [{ text: '', icon: 'Lightbulb' }];
};

const Dashboard: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfHistory, setPdfHistory] = useState<UploadedPdf[]>([]);
  const [pdfHistoryLoading, setPdfHistoryLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfCopied, setPdfCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { sitemap, saveSitemap } = useSiteData();

  // --- CMS STATE ---
  const [hero, setHero] = useState(sitemap.home.hero);

  const [benefit, setBenefit] = useState(sitemap.home.benefit);

  const [podcastSection, setPodcastSection] = useState(sitemap.home.podcastSection);

  const [headers, setHeaders] = useState(sitemap.home.headers);

  const [faqs, setFaqs] = useState(sitemap.faq.faqs);

  const [targets, setTargets] = useState(sitemap.home.targets);

  const [facts, setFacts] = useState<DashboardFact[]>(resolveDashboardFacts(sitemap));

  useEffect(() => {
    setHero(sitemap.home.hero);
    setBenefit(sitemap.home.benefit);
    setPodcastSection(sitemap.home.podcastSection);
    setHeaders(sitemap.home.headers);
    setTargets(sitemap.home.targets);
    setFacts(resolveDashboardFacts(sitemap));
    setFaqs(sitemap.faq.faqs);
  }, [sitemap]);

  const latestPdf = pdfHistory[0];

  const loadPdfHistory = async () => {
    setPdfHistoryLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY) || '';
      const response = await fetch(`${API_BASE}/api/uploads/pdfs`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error('PDF listəsi alınmadı.');
      }
      const payload = await response.json();
      setPdfHistory(Array.isArray(payload.files) ? payload.files : []);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'PDF listəsi xətası');
    } finally {
      setPdfHistoryLoading(false);
    }
  };

  useEffect(() => {
    void loadPdfHistory();
  }, []);

  // --- ACTIONS ---
  const handleSave = async () => {
    const normalizedFacts = facts.map((fact) => ({
      text: String(fact.text || ''),
      icon: String(fact.icon || 'Lightbulb'),
    }));

    const next = {
      ...sitemap,
      financialFacts: normalizedFacts.map((fact, index) => ({
        id: index + 1,
        text: fact.text,
        icon: fact.icon,
      })),
      home: { ...sitemap.home, hero, benefit, podcastSection, headers, targets, facts: normalizedFacts },
      faq: { ...sitemap.faq, faqs },
    };
    const ok = await saveSitemap(next);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingGuide(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Yükləmə uğursuz oldu');
      }
      const payload = await response.json();
      setBenefit({ ...benefit, fileName: file.name, fileUrl: payload.url || '' });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Yükləmə xətası');
    } finally {
      setUploadingGuide(false);
      if (e.target) e.target.value = '';
    }
  };

  const updateItem = (setter: any, index: number, field: string, value: any) => {
    setter((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (setter: any, index: number) => setter((prev: any) => prev.filter((_: any, i: number) => i !== index));

  const addFact = () => setFacts((prev) => [...prev, { text: 'Yeni fakt...', icon: 'Lightbulb' }]);

  const updateFactField = (index: number, field: keyof DashboardFact, value: string) => {
    setFacts((prev) => prev.map((fact, i) => (i === index ? { ...fact, [field]: value } : fact)));
  };

  const removeFact = (index: number) => {
    setFacts((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const duplicateFact = (index: number) => {
    setFacts((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const clone = { ...item };
      return [...prev.slice(0, index + 1), clone, ...prev.slice(index + 1)];
    });
  };

  const moveFact = (index: number, direction: -1 | 1) => {
    setFacts((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const onPickPdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] || null;
    setPdfError('');
    if (!picked) {
      setPdfFile(null);
      return;
    }
    const isPdf = picked.type === 'application/pdf' || picked.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfFile(null);
      setPdfError('Yalnız PDF faylı seçin (.pdf).');
      return;
    }
    setPdfFile(picked);
  };

  const uploadPdf = async () => {
    if (!pdfFile) {
      setPdfError('PDF faylı seçilməyib.');
      return;
    }
    setPdfUploading(true);
    setPdfError('');
    setPdfCopied(false);
    try {
      const token = localStorage.getItem(TOKEN_KEY) || '';
      const formData = new FormData();
      formData.append('file', pdfFile);
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error('PDF yükləmə alınmadı.');
      }
      await response.json();
      setPdfFile(null);
      await loadPdfHistory();
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'PDF yükləmə xətası');
    } finally {
      setPdfUploading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const copyLatestPdfUrl = async () => {
    if (!latestPdf?.url) return;
    await navigator.clipboard.writeText(latestPdf.url);
    setPdfCopied(true);
    setTimeout(() => setPdfCopied(false), 1200);
  };

  return (
    <div className="space-y-16 pb-32">
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ana Səhifə Redaktoru</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Bütün saytın CMS idarəetməsi</p>
        </div>
        <button onClick={handleSave} className="bg-primary-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95">
          {saved ? <Check size={20} /> : <Save size={20} />} {saved ? "Saxlanıldı" : "Bütün Dəyişiklikləri Saxla"}
        </button>
      </header>

      {/* 1. HERO & INTRODUCTION */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <Layout size={18} className="text-primary-600" /> 1. Hero (Giriş) Bölməsi
        </h3>
        <div className="space-y-8">
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Ana Başlıq</label>
            <input type="text" value={hero.title} onChange={e => setHero({...hero, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-black text-xl outline-none focus:border-primary-600 focus:bg-white transition-all" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Alt Mətn (Paraqraf)</label>
            <textarea rows={3} value={hero.sub} onChange={e => setHero({...hero, sub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 font-medium leading-relaxed outline-none focus:border-primary-600 focus:bg-white transition-all" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-6 bg-primary-50 rounded-[2rem] border border-primary-100">
                <p className="text-[9px] font-black text-primary-600 uppercase mb-4 tracking-widest">Sol Düymə</p>
                <div className="space-y-3">
                   <input type="text" value={hero.btn1Text} onChange={e => setHero({...hero, btn1Text: e.target.value})} className="w-full bg-white border border-primary-100 rounded-xl px-4 py-2.5 text-sm font-black" placeholder="Mətn" />
                   <input type="text" value={hero.btn1Link} onChange={e => setHero({...hero, btn1Link: e.target.value})} className="w-full bg-white/50 border border-primary-50 rounded-xl px-4 py-2 text-[10px] font-bold text-primary-400" placeholder="Link" />
                </div>
             </div>
             <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Sağ Düymə</p>
                <div className="space-y-3">
                   <input type="text" value={hero.btn2Text} onChange={e => setHero({...hero, btn2Text: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black" placeholder="Mətn" />
                   <input type="text" value={hero.btn2Link} onChange={e => setHero({...hero, btn2Link: e.target.value})} className="w-full bg-white/50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-400" placeholder="Link" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. WEEKLY BENEFIT (SENTENCE BY SENTENCE) */}
      <section className="bg-slate-900 p-12 rounded-[3.5rem] text-white">
        <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
          <Download size={18} /> 2. Həftənin Faydası (Fayl & Cümlələr)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="space-y-8">
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Bölmə Başlığı</label>
                <input type="text" value={benefit.header} onChange={e => setBenefit({...benefit, header: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-lg outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Alt Təsvir (Cümlə)</label>
                <textarea rows={2} value={benefit.desc} onChange={e => setBenefit({...benefit, desc: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium text-sm outline-none focus:border-primary-500" />
              </div>
              <div className="space-y-4">
                 <label className="block text-[9px] font-black text-primary-400 uppercase tracking-widest mb-2">Siyahıdakı Cümlələr</label>
                 {benefit.items.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 group">
                       <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center text-primary-400">
                          <FileCheck size={18} />
                       </div>
                       <input 
                          type="text" 
                          value={item.text} 
                          onChange={e => {
                            const newItems = [...benefit.items];
                            newItems[idx].text = e.target.value;
                            setBenefit({...benefit, items: newItems});
                          }}
                          className="flex-1 bg-transparent border-none text-white font-bold text-sm outline-none" 
                       />
                       <button onClick={() => setBenefit({...benefit, items: benefit.items.filter((_, i) => i !== idx)})} className="p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 ))}
                 <button onClick={() => setBenefit({...benefit, items: [...benefit.items, { id: Date.now(), text: "Yeni cümlə..." }]})} className="w-full py-3 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-primary-500 hover:text-primary-400 transition-all">
                    + Yeni Sətir Əlavə Et
                 </button>
              </div>
           </div>
           
           <div className="space-y-8 p-10 bg-white/5 rounded-[3rem] border border-white/10 flex flex-col justify-center">
              <label className="block text-[9px] font-black text-primary-400 uppercase tracking-widest mb-4 text-center">Yükləmə Düyməsi & Fayl</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-primary-500 transition-all group"
              >
                 <Upload className="text-primary-500 mb-4 group-hover:scale-110 transition-all" size={40} />
                 <p className="text-lg font-black text-white">{uploadingGuide ? "Yüklənir..." : (benefit.fileName || "Faylı Buraya Atın")}</p>
                 <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">PDF, Excel və ya Rəhbər seçin</p>
                 <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
              </div>
              {uploadError ? <div className="text-xs font-bold text-red-300">{uploadError}</div> : null}
              <input
                type="text"
                value={benefit.fileUrl || ''}
                onChange={e => setBenefit({ ...benefit, fileUrl: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold text-white"
                placeholder="Fayl URL (/uploads/...)"
              />
              <input type="text" value={benefit.btnText} onChange={e => setBenefit({...benefit, btnText: e.target.value})} className="w-full bg-white text-slate-900 border-none rounded-2xl px-6 py-5 text-base font-black text-center shadow-2xl shadow-white/5" placeholder="Düymə Mətni" />
           </div>
        </div>
      </section>

      {/* 3. PODCAST SECTION (FINANCIAL CONVERSATIONS) */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <Mic size={18} className="text-primary-600" /> 3. Maliyyə Söhbətləri (Podcast Yazıları)
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Kiçik Etiket (Badge)</label>
                  <input type="text" value={podcastSection.badge} onChange={e => setPodcastSection({...podcastSection, badge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-primary-600 text-xs tracking-widest" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Bölmə Başlığı</label>
                  <input type="text" value={podcastSection.title} onChange={e => setPodcastSection({...podcastSection, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900 text-2xl" />
               </div>
            </div>
            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Alt Yazı (Təsvir)</label>
                  <textarea rows={2} value={podcastSection.sub} onChange={e => setPodcastSection({...podcastSection, sub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-500" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Düymə Mətni (Sağ tərəf)</label>
                  <input type="text" value={podcastSection.btnText} onChange={e => setPodcastSection({...podcastSection, btnText: e.target.value})} className="w-full bg-slate-900 text-white border-none rounded-xl px-4 py-3 font-black text-sm" />
               </div>
            </div>
         </div>
      </section>

      {/* 4. BLOG & NEWSLETTER (SEPARATED AS REQUESTED) */}
      <section className="space-y-8">
         {/* Blog Section Headers */}
         <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
               <FileText size={18} className="text-primary-600" /> 4. Bloq Bölməsi Yazıları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ana Bloq Başlığı</label>
                  <input type="text" value={headers.blogTitle} onChange={e => setHeaders({...headers, blogTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Bloq Alt Yazısı</label>
                  <input type="text" value={headers.blogSub} onChange={e => setHeaders({...headers, blogSub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-500" />
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* The Dark Blog Card */}
            <div className="p-10 bg-slate-900 rounded-[3.5rem] text-white">
               <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-8">Bloq Keçid Kartı (Tünd)</label>
               <div className="space-y-6">
                  <div>
                     <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Kart Başlığı</label>
                     <input type="text" value={headers.blogCardTitle} onChange={e => setHeaders({...headers, blogCardTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-black text-white text-lg" />
                  </div>
                  <div>
                     <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Statistika / Alt Yazı</label>
                     <input type="text" value={headers.blogCardSub} onChange={e => setHeaders({...headers, blogCardSub: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 font-medium text-slate-400 text-sm" />
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                     <BookOpen className="text-primary-500" size={20} />
                     <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Bu kart ana səhifədəki sonuncu bloq blokudur.</p>
                  </div>
               </div>
            </div>

            {/* Newsletter Card */}
            <div className="p-10 bg-primary-600 rounded-[3.5rem] text-white relative overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-10">
                  <Mail size={160} />
               </div>
               <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-8 relative z-10">Newsletter (Abunə) Bölməsi</label>
               <div className="space-y-6 relative z-10">
                  <div>
                     <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Başlıq</label>
                     <input type="text" value={headers.newsTitle} onChange={e => setHeaders({...headers, newsTitle: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 font-black text-white text-xl" />
                  </div>
                  <div>
                     <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Alt Yazı</label>
                     <textarea rows={2} value={headers.newsSub} onChange={e => setHeaders({...headers, newsSub: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 font-medium text-white/80 text-sm" />
                  </div>
                  <div>
                     <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Düymə Mətni</label>
                     <input type="text" value={headers.newsBtnText} onChange={e => setHeaders({...headers, newsBtnText: e.target.value})} className="w-full bg-white text-primary-600 border-none rounded-2xl px-5 py-4 font-black text-center" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 5. TARGETS & FACTS (ICON PICKERS) */}
      <section className="space-y-8">
         {/* Targets Section */}
         <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-end mb-12">
               <div className="flex-1 max-w-xl">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                     <Users size={18} className="text-primary-600" /> Bu platforma kimlər üçündür?
                  </label>
                  <input type="text" value={headers.targetsTitle} onChange={e => setHeaders({...headers, targetsTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-xl" />
               </div>
               <button onClick={() => setTargets([...targets, { title: 'Yeni', desc: '...', icon: 'Briefcase' }])} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl ml-6">Yeni Kart</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {targets.map((t, idx) => (
                  <div key={idx} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group hover:bg-white hover:edu-card-shadow transition-all duration-500">
                     <button onClick={() => removeItem(setTargets, idx)} className="absolute top-8 right-8 text-slate-300 hover:text-red-600 transition-colors">
                        <Trash2 size={20} />
                     </button>
                     <div className="space-y-6">
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">İkon Seçimi</label>
                           <IconPicker current={t.icon} onSelect={(key) => updateItem(setTargets, idx, 'icon', key)} />
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Başlıq</label>
                           <input type="text" value={t.title} onChange={e => updateItem(setTargets, idx, 'title', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-slate-900" />
                        </div>
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Qısa Təsvir</label>
                           <textarea rows={2} value={t.desc} onChange={e => updateItem(setTargets, idx, 'desc', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-medium text-slate-500 text-sm" />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Facts Section */}
         <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                     <Lightbulb size={18} className="text-amber-500" /> Bilik Sandığı (Başlıqlar)
                  </label>
                  <input type="text" value={headers.factsTitle} onChange={e => setHeaders({...headers, factsTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-xl" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Alt Yazı</label>
                  <input type="text" value={headers.factsSub} onChange={e => setHeaders({...headers, factsSub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-500" />
               </div>
            </div>
            
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fakt sayı: {facts.length}</p>
              <p className="text-xs font-medium text-slate-400">Hər fakt üçün ikon, mətn və önizləmə</p>
            </div>
            <div className="space-y-6">
               {facts.map((f, idx) => {
                  const FactIcon = ICON_BY_KEY[f.icon] || Lightbulb;
                  return (
                    <div key={`${idx}-${f.icon}`} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Fakt #{idx + 1}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => moveFact(idx, -1)} disabled={idx === 0} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-800">
                            <ArrowUp size={16} />
                          </button>
                          <button onClick={() => moveFact(idx, 1)} disabled={idx === facts.length - 1} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-800">
                            <ArrowDown size={16} />
                          </button>
                          <button onClick={() => duplicateFact(idx)} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary-600">
                            <Copy size={16} />
                          </button>
                          <button onClick={() => removeFact(idx)} disabled={facts.length <= 1} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-5 space-y-4">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">İkon seçimi</label>
                            <IconPicker current={f.icon} onSelect={(key) => updateFactField(idx, 'icon', key)} />
                          </div>
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">İkon adı</label>
                            <select value={f.icon} onChange={(e) => updateFactField(idx, 'icon', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary-600">
                              {ICON_OPTIONS.map((opt) => (
                                <option key={opt.key} value={opt.key}>{opt.key}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="xl:col-span-7 space-y-4">
                          <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Mətn</label>
                            <textarea value={f.text} onChange={(e) => updateFactField(idx, 'text', e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-5 font-bold text-slate-700 text-base outline-none focus:border-primary-600 transition-all" rows={3} />
                          </div>
                          <div className="bg-white p-6 rounded-2xl border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-5">
                              <FactIcon size={82} />
                            </div>
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-4">
                              <FactIcon size={24} />
                            </div>
                            <p className="text-slate-700 font-bold leading-relaxed">{f.text || 'Fakt mətnini daxil edin...'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
               })}
               <button onClick={addFact} className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-slate-200 transition-all">
                  + Yeni Fakt Əlavə Et
               </button>
            </div>
         </div>
      </section>

      {/* 6. FAQ SECTION (DIRECTLY ON DASHBOARD AS REQUESTED) */}
      <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
         <div className="mb-12">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
               <HelpCircle size={18} className="text-primary-600" /> 6. Tez-tez Verilən Suallar (FAQ)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">FAQ Ümumi Başlıq</label>
                  <input type="text" value={headers.faqTitle} onChange={e => setHeaders({...headers, faqTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">FAQ Alt Yazı</label>
                  <input type="text" value={headers.faqSub} onChange={e => setHeaders({...headers, faqSub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-500" />
               </div>
            </div>
         </div>

         <div className="space-y-6">
            {faqs.map((faq, idx) => (
               <div key={idx} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group transition-all hover:bg-white hover:edu-card-shadow">
                  <button onClick={() => removeItem(setFaqs, idx)} className="absolute top-8 right-8 text-slate-300 hover:text-red-600 transition-colors">
                     <Trash2 size={22} />
                  </button>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Sual</label>
                        <input type="text" value={faq.q} onChange={e => updateItem(setFaqs, idx, 'q', e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 text-lg outline-none focus:border-primary-600 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cavab</label>
                        <textarea rows={3} value={faq.a} onChange={e => updateItem(setFaqs, idx, 'a', e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 font-medium text-slate-600 outline-none focus:border-primary-600 transition-all" />
                     </div>
                  </div>
               </div>
            ))}
            <button onClick={() => setFaqs([...faqs, { q: "Yeni sual?", a: "Cavab..." }])} className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">
               + Yeni Sual Əlavə Et
            </button>
         </div>
      </section>

      {/* 7. PDF UPLOAD (MOVED FROM EXTRA TAB) */}
      <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
          <Upload size={18} className="text-primary-600" /> 7. PDF Yükləmə (Ana Səhifə)
        </h3>

        {pdfError ? <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-bold">{pdfError}</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
            <label className="w-full block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white cursor-pointer hover:border-primary-500 transition-colors">
              <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onPickPdfFile} />
              <div className="flex flex-col items-center gap-3">
                <FileText size={32} className="text-slate-500" />
                <div className="text-sm font-black text-slate-700">{pdfFile ? pdfFile.name : 'PDF seçmək üçün klik et'}</div>
                <div className="text-xs font-bold text-slate-400">Yalnız PDF faylı seçin (.pdf)</div>
              </div>
            </label>

            <button
              type="button"
              onClick={() => void uploadPdf()}
              disabled={pdfUploading || !pdfFile}
              className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest disabled:opacity-60 flex items-center gap-2"
            >
              {pdfUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {pdfUploading ? 'Yüklənir...' : 'PDF Yüklə'}
            </button>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Son Yüklənən PDF</h4>
            {pdfHistoryLoading ? (
              <p className="text-sm font-bold text-slate-500">Yüklənən PDF-lər oxunur...</p>
            ) : !latestPdf ? (
              <p className="text-sm font-bold text-slate-500">Hələ PDF yüklənməyib.</p>
            ) : (
              <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                <div className="text-sm font-black text-slate-900">{latestPdf.name}</div>
                <div className="text-xs font-medium text-slate-500">Ölçü: {humanFileSize(latestPdf.size)}</div>
                <div className="flex flex-wrap gap-2">
                  <input readOnly value={latestPdf.url} className="flex-1 min-w-[220px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700" />
                  <button
                    type="button"
                    onClick={() => void copyLatestPdfUrl()}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    {pdfCopied ? <Check size={14} /> : <Copy size={14} />}
                    {pdfCopied ? 'Kopyalandı' : 'URL Kopyala'}
                  </button>
                  <a
                    href={latestPdf.absoluteUrl || latestPdf.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <ExternalLink size={14} /> Aç
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
