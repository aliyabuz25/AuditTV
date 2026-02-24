
import React, { useEffect, useRef, useState } from 'react';
import { 
  Save, Check, Plus, Trash2, Award, Layout, Target, Users, 
  Lightbulb, Briefcase, ShieldCheck, Globe, Rocket, Zap, 
  CheckCircle2, Cpu, Shield, UserCheck, BarChart3,
  MessageSquare, HelpCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const ICON_OPTIONS = [
  { key: 'ShieldCheck', Icon: ShieldCheck },
  { key: 'Lightbulb', Icon: Lightbulb },
  { key: 'Globe', Icon: Globe },
  { key: 'Target', Icon: Target },
  { key: 'Award', Icon: Award },
  { key: 'Cpu', Icon: Cpu },
  { key: 'Shield', Icon: Shield },
  { key: 'UserCheck', Icon: UserCheck },
  { key: 'Zap', Icon: Zap },
  { key: 'Rocket', Icon: Rocket },
  { key: 'Briefcase', Icon: Briefcase },
  { key: 'BarChart3', Icon: BarChart3 }
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

const AboutManager: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const { sitemap, saveSection } = useSiteData();
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  // --- CMS STATE ---
  
  // 1. Hero Section
  const [hero, setHero] = useState(sitemap.about.hero);

  // 2. Narrative Section
  const [narrative, setNarrative] = useState(sitemap.about.narrative);

  // 3. Values Section
  const [values, setValues] = useState(sitemap.about.values);

  // 4. Why Audit TV Section
  const [whyUs, setWhyUs] = useState(sitemap.about.whyUs);

  // 5. Vision Section
  const [vision, setVision] = useState(sitemap.about.vision);

  // 6. Team
  const [team, setTeam] = useState(sitemap.about.team);

  useEffect(() => {
    setHero(sitemap.about.hero);
    setNarrative(sitemap.about.narrative);
    setValues(sitemap.about.values);
    setWhyUs(sitemap.about.whyUs);
    setVision(sitemap.about.vision);
    setTeam(sitemap.about.team);
  }, [sitemap.about]);

  // --- ACTIONS ---
  const handleSave = async () => {
    const ok = await saveSection('about', { hero, narrative, values, whyUs, vision, team });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const updateItem = (setter: any, index: number, field: string, value: any) => {
    setter((prev: any) => prev.map((item: any, i: number) => i === index ? { ...item, [field]: value } : item));
  };

  const removeItem = (setter: any, index: number) => setter((prev: any) => prev.filter((_: any, i: number) => i !== index));

  const uploadHeroImage = async (file: File) => {
    setUploadingHeroImage(true);
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
        setHero((prev: any) => ({ ...prev, imageUrl: payload.url }));
      }
    } finally {
      setUploadingHeroImage(false);
    }
  };

  return (
    <div className="space-y-16 pb-32">
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Haqqımızda Redaktoru</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Səhifənin bütün məzmunu</p>
        </div>
        <button onClick={handleSave} className="bg-primary-600 text-white px-10 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95">
          {saved ? <Check size={20} /> : <Save size={20} />} {saved ? "Saxlanıldı" : "Bütün Dəyişiklikləri Saxla"}
        </button>
      </header>

      {/* 1. HERO SECTION & STATS */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <Layout size={18} className="text-primary-600" /> 1. Hero & Statistika
        </h3>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Giriş Etiketi (Badge)</label>
                <input type="text" value={hero.badge} onChange={e => setHero({...hero, badge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-bold" />
             </div>
             <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Əsas Başlıq</label>
                <div className="flex gap-2">
                   <input type="text" value={hero.title} onChange={e => setHero({...hero, title: e.target.value})} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold" />
                   <input type="text" value={hero.spanTitle} onChange={e => setHero({...hero, spanTitle: e.target.value})} className="flex-1 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm font-bold text-primary-600" />
                </div>
             </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Alt Yazı</label>
            <textarea rows={3} value={hero.sub} onChange={e => setHero({...hero, sub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 font-medium leading-relaxed outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             <div className="space-y-3">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Hero Şəkli URL</label>
                <input
                  type="text"
                  value={hero.imageUrl || ''}
                  onChange={e => setHero({ ...hero, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm font-medium text-slate-700"
                  placeholder="/uploads/... və ya https://..."
                />
             </div>
             <div className="space-y-3">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Şəkli Yüklə</label>
                <button
                  onClick={() => heroImageInputRef.current?.click()}
                  disabled={uploadingHeroImage}
                  className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {uploadingHeroImage ? <Upload size={16} className="animate-pulse" /> : <ImageIcon size={16} />}
                  {uploadingHeroImage ? 'Yüklənir...' : 'Hero Şəkli Yüklə'}
                </button>
                <input
                  ref={heroImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadHeroImage(file);
                  }}
                />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
                { val: hero.stat1Year, label: hero.stat1Label, f1: 'stat1Year', f2: 'stat1Label' },
                { val: hero.stat2Val, label: hero.stat2Label, f1: 'stat2Val', f2: 'stat2Label' },
                { val: hero.stat3Val, label: hero.stat3Label, f1: 'stat3Val', f2: 'stat3Label' }
             ].map((st, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                   <input type="text" value={st.val} onChange={e => setHero({...hero, [st.f1]: e.target.value})} className="w-full bg-transparent border-none text-2xl font-black text-slate-900 mb-1" />
                   <input type="text" value={st.label} onChange={e => setHero({...hero, [st.f2]: e.target.value})} className="w-full bg-transparent border-none text-[9px] font-black text-slate-400 uppercase tracking-widest" />
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* 2. NARRATIVE SECTION */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <MessageSquare size={18} className="text-primary-600" /> 2. Hekayəmiz & Giriş
         </h3>
         <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Hekayə Başlığı</label>
                  <input type="text" value={narrative.title} onChange={e => setNarrative({...narrative, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 font-black text-slate-900" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Vurğulu Sitat (Quote)</label>
                  <input type="text" value={narrative.quote} onChange={e => setNarrative({...narrative, quote: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 font-bold text-slate-800 italic" />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Paraqraf 1</label>
                  <textarea rows={4} value={narrative.para1} onChange={e => setNarrative({...narrative, para1: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 font-medium text-sm leading-relaxed" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Paraqraf 2</label>
                  <textarea rows={4} value={narrative.para2} onChange={e => setNarrative({...narrative, para2: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-600 font-medium text-sm leading-relaxed" />
               </div>
            </div>
         </div>
      </section>

      {/* 3. CORE VALUES */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <Award size={18} className="text-primary-600" /> 3. Korporativ Dəyərlər
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, idx) => (
               <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group">
                  <button onClick={() => removeItem(setValues, idx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-600 transition-colors">
                     <Trash2 size={18} />
                  </button>
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">İkon Seçimi</label>
                        <IconPicker current={v.icon} onSelect={(key) => updateItem(setValues, idx, 'icon', key)} />
                     </div>
                     <input type="text" value={v.title} onChange={e => updateItem(setValues, idx, 'title', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-black text-slate-900" placeholder="Başlıq" />
                     <textarea value={v.desc} onChange={e => updateItem(setValues, idx, 'desc', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-500" placeholder="Təsvir" rows={2} />
                  </div>
               </div>
            ))}
            <button onClick={() => setValues([...values, { icon: 'Target', title: 'Yeni Dəyər', desc: '...' }])} className="md:col-span-2 py-5 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
               + Yeni Dəyər Əlavə Et
            </button>
         </div>
      </section>

      {/* 4. WHY AUDIT TV? */}
      <section className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-200">
         <div className="mb-10 flex items-center gap-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
               <HelpCircle size={18} className="text-primary-600" /> 4. Niyə Biz? Bölməsi
            </h3>
            <div className="flex-1 flex gap-2">
               <input type="text" value={whyUs.title} onChange={e => setWhyUs({...whyUs, title: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-black" />
               <input type="text" value={whyUs.spanTitle} onChange={e => setWhyUs({...whyUs, spanTitle: e.target.value})} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-primary-600" />
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyUs.items.map((item, idx) => (
               <div key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative group">
                  <div className="absolute top-6 right-6 text-2xl font-black text-slate-50 group-hover:text-primary-50 transition-colors">
                     {item.number}
                  </div>
                  <div className="space-y-6">
                     <div className="w-fit">
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">İkon</label>
                        <IconPicker current={item.icon} onSelect={(key) => {
                           const newItems = [...whyUs.items];
                           newItems[idx].icon = key;
                           setWhyUs({...whyUs, items: newItems});
                        }} />
                     </div>
                     <input type="text" value={item.title} onChange={e => {
                        const newItems = [...whyUs.items];
                        newItems[idx].title = e.target.value;
                        setWhyUs({...whyUs, items: newItems});
                     }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-black text-slate-900" />
                     <textarea rows={3} value={item.desc} onChange={e => {
                        const newItems = [...whyUs.items];
                        newItems[idx].desc = e.target.value;
                        setWhyUs({...whyUs, items: newItems});
                     }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium text-slate-500" />
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* 5. VISION 2030 (FIXED OVERLAP) */}
      <section className="bg-slate-900 p-12 rounded-[3.5rem] text-white overflow-hidden">
         <h3 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
            <Rocket size={18} /> 5. Vizyon 2030 (CMS)
         </h3>
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-12">
            {/* Left Column: Vision Details */}
            <div className="flex flex-col gap-8">
               <div className="space-y-4">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Etiket (Badge)</label>
                  <input type="text" value={vision.badge} onChange={e => setVision({...vision, badge: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-bold text-primary-400 outline-none focus:border-primary-500" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Başlıq</label>
                     <input type="text" value={vision.title} onChange={e => setVision({...vision, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-black text-white outline-none focus:border-primary-500" />
                  </div>
                  <div className="space-y-2">
                     <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Vurğulu İL</label>
                     <input type="text" value={vision.spanTitle} onChange={e => setVision({...vision, spanTitle: e.target.value})} className="w-full bg-primary-600 border-none rounded-xl px-4 py-3 font-black text-white outline-none shadow-lg shadow-primary-900/20" />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Təsvir Mətni</label>
                  <textarea rows={4} value={vision.sub} onChange={e => setVision({...vision, sub: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium text-sm leading-relaxed outline-none focus:border-primary-500" />
               </div>
            </div>
            
            {/* Right Column: Goals List */}
            <div className="flex flex-col gap-6">
               <label className="block text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-2">Hədəflər Siyahısı (Gələcəyə Baxış)</label>
               <div className="space-y-4">
                  {vision.goals.map((goal, idx) => (
                     <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group relative">
                        <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center text-primary-400 flex-shrink-0">
                           <CheckCircle2 size={18} />
                        </div>
                        <input 
                           type="text" 
                           value={goal} 
                           onChange={e => {
                              const newGoals = [...vision.goals];
                              newGoals[idx] = e.target.value;
                              setVision({...vision, goals: newGoals});
                           }}
                           className="flex-1 bg-transparent border-none text-white font-bold text-sm outline-none pr-10" 
                        />
                        <button onClick={() => {
                           const newGoals = vision.goals.filter((_, i) => i !== idx);
                           setVision({...vision, goals: newGoals});
                        }} className="p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  ))}
               </div>
               <button onClick={() => setVision({...vision, goals: [...vision.goals, "Yeni hədəf..."]})} className="w-full py-4 mt-2 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-primary-500 hover:text-primary-400 hover:bg-white/5 transition-all">
                  + Yeni Hədəf Əlavə Et
               </button>
            </div>
         </div>
      </section>

      {/* 6. TEAM MEMBERS */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
               <Users size={18} className="text-primary-600" /> 6. Ekspert Komandamız
            </h3>
            <button onClick={() => setTeam([...team, { id: Date.now().toString(), name: 'Yeni Üzv', role: 'Vəzifə', imageUrl: '', bio: '' }])} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest">Yeni Üzv</button>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((m, idx) => (
               <div key={m.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group">
                  <button onClick={() => removeItem(setTeam, idx)} className="absolute top-8 right-8 text-slate-300 hover:text-red-600">
                     <Trash2 size={20} />
                  </button>
                  <div className="space-y-6">
                     <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-slate-200 rounded-2xl overflow-hidden flex-shrink-0">
                           {m.imageUrl && <img src={m.imageUrl} className="w-full h-full object-cover" alt="" />}
                        </div>
                        <div className="flex-1 space-y-2">
                           <input type="text" value={m.name} onChange={e => updateItem(setTeam, idx, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-slate-900" placeholder="Ad Soyad" />
                           <input type="text" value={m.role} onChange={e => updateItem(setTeam, idx, 'role', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-primary-600" placeholder="Vəzifə" />
                        </div>
                     </div>
                     <textarea rows={3} value={m.bio} onChange={e => updateItem(setTeam, idx, 'bio', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-500" placeholder="Bioqrafiya mətni..." />
                     <input type="text" value={m.imageUrl} onChange={e => updateItem(setTeam, idx, 'imageUrl', e.target.value)} className="w-full bg-white/50 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-bold text-slate-400" placeholder="Şəkil URL" />
                  </div>
               </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default AboutManager;
