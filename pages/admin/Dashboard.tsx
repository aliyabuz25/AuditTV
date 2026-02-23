
import React, { useEffect, useRef, useState } from 'react';
import { 
  Save, Layout, Check, Plus, Trash2, 
  Download, Users, Lightbulb, 
  MessageSquare, Mail, Mic, FileText, Upload, BookOpen,
  ShieldCheck, Calculator, PieChart, UserCheck, Briefcase, Cpu, TrendingUp, AlertCircle, FileCheck, Headphones, HelpCircle
} from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

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

const IconPicker = ({ current, onSelect }: { current: string, onSelect: (key: string) => void }) => {
  return (
    <div className="grid grid-cols-6 gap-2 p-3 bg-white rounded-2xl border border-slate-200">
      {ICON_OPTIONS.map(({ key, Icon }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
            current === key ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
          }`}
          title={key}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [uploadingGuide, setUploadingGuide] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sitemap, saveSitemap } = useSiteData();

  // --- CMS STATE ---
  const [hero, setHero] = useState(sitemap.home.hero);

  const [benefit, setBenefit] = useState(sitemap.home.benefit);

  const [podcastSection, setPodcastSection] = useState(sitemap.home.podcastSection);

  const [headers, setHeaders] = useState(sitemap.home.headers);

  const [faqs, setFaqs] = useState(sitemap.faq.faqs);

  const [targets, setTargets] = useState(sitemap.home.targets);

  const [facts, setFacts] = useState(sitemap.home.facts);

  useEffect(() => {
    setHero(sitemap.home.hero);
    setBenefit(sitemap.home.benefit);
    setPodcastSection(sitemap.home.podcastSection);
    setHeaders(sitemap.home.headers);
    setTargets(sitemap.home.targets);
    setFacts(sitemap.home.facts);
    setFaqs(sitemap.faq.faqs);
  }, [sitemap]);

  // --- ACTIONS ---
  const handleSave = async () => {
    const next = {
      ...sitemap,
      home: { ...sitemap.home, hero, benefit, podcastSection, headers, targets, facts },
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
            
            <div className="space-y-6">
               {facts.map((f, idx) => (
                  <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col lg:flex-row gap-10 items-start lg:items-center relative group">
                     <button onClick={() => removeItem(setFacts, idx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={20} />
                     </button>
                     <div className="w-full lg:w-72">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">İkon</label>
                        <IconPicker current={f.icon} onSelect={(key) => updateItem(setFacts, idx, 'icon', key)} />
                     </div>
                     <textarea value={f.text} onChange={e => updateItem(setFacts, idx, 'text', e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-[2rem] px-8 py-6 font-bold text-slate-700 text-lg outline-none focus:border-primary-600 transition-all" rows={2} />
                  </div>
               ))}
               <button onClick={() => setFacts([...facts, { text: 'Yeni fakt...', icon: 'Lightbulb' }])} className="w-full py-5 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:bg-slate-50 hover:border-slate-200 transition-all">
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
    </div>
  );
};

export default Dashboard;
