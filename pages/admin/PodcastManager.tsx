
import React, { useEffect, useRef, useState } from 'react';
import { 
  Save, Plus, Trash2, Mic, Play, Clock, Calendar, 
  Video, Headphones, Search, X, Edit3, Image as ImageIcon,
  Check, Info, BarChart3, TrendingUp, Users, Upload, Layout
} from 'lucide-react';
import { PodcastEpisode } from '../../types';
import { useSiteData } from '../../site/SiteDataContext';

const PodcastManager: React.FC = () => {
  const { sitemap, saveSection } = useSiteData();
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>(sitemap.podcast.episodes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<PodcastEpisode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

  // Podcast Page Headers State
  const [pageHeader, setPageHeader] = useState(sitemap.podcast.pageHeader);

  useEffect(() => {
    setEpisodes(sitemap.podcast.episodes);
    setPageHeader(sitemap.podcast.pageHeader);
  }, [sitemap.podcast]);

  const handleSaveAll = async () => {
    const ok = await saveSection('podcast', { pageHeader, episodes });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const openEditModal = (episode: PodcastEpisode | null = null) => {
    if (episode) {
      setEditingEpisode({ ...episode });
    } else {
      setEditingEpisode({
        id: Date.now().toString(),
        title: '',
        description: '',
        duration: '',
        date: new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' }),
        host: 'İbadət Binyətov',
        thumbnailUrl: '',
        videoUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEpisode) return;

    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.url) {
      setEditingEpisode({ ...editingEpisode, thumbnailUrl: payload.url });
    }
  };

  const saveEpisode = async () => {
    if (!editingEpisode) return;
    const nextEpisodes = episodes.find(e => e.id === editingEpisode.id)
      ? episodes.map(e => e.id === editingEpisode.id ? editingEpisode : e)
      : [editingEpisode, ...episodes];

    const ok = await saveSection('podcast', { pageHeader, episodes: nextEpisodes });
    if (!ok) return;
    setEpisodes(nextEpisodes);
    setIsModalOpen(false);
    setEditingEpisode(null);
  };

  const deleteEpisode = async (id: string) => {
    if (window.confirm('Bu epizodu silmək istədiyinizə əminsiniz?')) {
      const nextEpisodes = episodes.filter(e => e.id !== id);
      const ok = await saveSection('podcast', { pageHeader, episodes: nextEpisodes });
      if (ok) setEpisodes(nextEpisodes);
    }
  };

  const filteredEpisodes = episodes.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-32">
      {/* Header Area */}
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Podcast Redaktoru</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Səhifə və Epizodların İdarəedilməsi</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => openEditModal()} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
              <Plus size={18} /> Yeni Epizod
           </button>
           <button onClick={handleSaveAll} className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95">
              {saved ? <Check size={18} /> : <Save size={18} />} {saved ? "Saxlanıldı" : "Dəyişiklikləri Saxla"}
           </button>
        </div>
      </header>

      {/* 1. Public Page Header Editor */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <Layout size={18} className="text-primary-600" /> 1. Səhifə Başlığı (Maliyyə Söhbətləri)
         </h3>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Giriş Etiketi (Badge)</label>
                  <input type="text" value={pageHeader.badge} onChange={e => setPageHeader({...pageHeader, badge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-bold text-primary-600 text-xs tracking-widest outline-none focus:border-primary-500 transition-all" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Əsas Səhifə Başlığı</label>
                  <input type="text" value={pageHeader.title} onChange={e => setPageHeader({...pageHeader, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-black text-slate-900 text-xl outline-none focus:border-primary-500 transition-all" />
               </div>
            </div>
            <div>
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Podcast Təsviri (Açıqlama)</label>
               <textarea rows={5} value={pageHeader.description} onChange={e => setPageHeader({...pageHeader, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-600 font-medium text-sm leading-relaxed outline-none focus:border-primary-500 transition-all" />
            </div>
         </div>
      </section>

      {/* Episodes List Control */}
      <section className="space-y-8">
         <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="relative w-full md:w-96">
               <input type="text" placeholder="Epizod axtar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pl-12 font-bold text-slate-900 outline-none focus:border-primary-600 transition-all shadow-sm" />
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm">
               <Info size={14} className="text-primary-600" /> Cəmi {filteredEpisodes.length} Epizod tapıldı
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEpisodes.map(ep => (
               <div key={ep.id} className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                     <img src={ep.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                     <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-slate-900 tracking-widest">{ep.date}</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-2 h-[3rem] group-hover:text-primary-600 transition-colors">{ep.title}</h3>
                     <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Host</span>
                           <span className="text-xs font-bold text-slate-900">{ep.host}</span>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => openEditModal(ep)} className="p-3 bg-slate-50 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all"><Edit3 size={18} /></button>
                           <button onClick={() => deleteEpisode(ep.id)} className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Epizod Editor Modal */}
      {isModalOpen && editingEpisode && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in fade-in duration-300">
               <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50/50">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Epizod Redaktoru</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Video, Şəkil və Yayım Tarixi</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"><X size={20} /></button>
               </div>

               <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-h-[70vh] overflow-y-auto">
                  {/* Form Side */}
                  <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Epizod Başlığı</label>
                        <input type="text" value={editingEpisode.title} onChange={e => setEditingEpisode({...editingEpisode, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:border-primary-600 transition-all" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Müddət</label>
                           <input type="text" value={editingEpisode.duration} onChange={e => setEditingEpisode({...editingEpisode, duration: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:border-primary-600 transition-all" placeholder="35 dəq" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                              <Calendar size={12} className="text-primary-600" /> Yayım Tarixi
                           </label>
                           <input type="text" value={editingEpisode.date} onChange={e => setEditingEpisode({...editingEpisode, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:border-primary-600 transition-all" placeholder="24 Noyabr 2025" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Host</label>
                        <input type="text" value={editingEpisode.host} onChange={e => setEditingEpisode({...editingEpisode, host: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:border-primary-600 transition-all" />
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Qısa Təsvir</label>
                        <textarea rows={4} value={editingEpisode.description} onChange={e => setEditingEpisode({...editingEpisode, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-medium text-slate-600 outline-none focus:border-primary-600 transition-all leading-relaxed" />
                     </div>
                  </div>

                  {/* Media Side */}
                  <div className="space-y-8">
                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <ImageIcon size={14} className="text-primary-600" /> Şəkil Yükləmə (Thumbnail)
                        </label>
                        <div onClick={() => fileInputRef.current?.click()} className="group relative aspect-video rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-all">
                           {editingEpisode.thumbnailUrl ? (
                              <>
                                <img src={editingEpisode.thumbnailUrl} className="w-full h-full object-cover" alt="Preview" />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                   <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Şəkli Dəyiş</div>
                                </div>
                              </>
                           ) : (
                              <div className="text-center">
                                 <Upload className="mx-auto text-slate-300 mb-4" size={40} />
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kompyuterdən şəkil seçin</p>
                              </div>
                           )}
                           <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <Video size={14} className="text-emerald-600" /> Media / Video Link (YouTube/MP4)
                        </label>
                        <input type="text" value={editingEpisode.videoUrl} onChange={e => setEditingEpisode({...editingEpisode, videoUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-400 text-xs outline-none focus:border-emerald-600 transition-all" placeholder="Media linkini daxil edin" />
                        <div className="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4">
                           <Info size={18} className="text-emerald-600 flex-shrink-0" />
                           <p className="text-[10px] text-emerald-700 font-bold leading-relaxed uppercase">Düzgün link daxil etməyiniz epizodun işləməsini təmin edir.</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-900">Ləğv Et</button>
                  <button onClick={saveEpisode} className="px-12 py-4 bg-primary-600 text-white font-black rounded-[1.5rem] shadow-2xl text-sm uppercase tracking-widest active:scale-95 flex items-center gap-3">
                     <Check size={20} /> Epizodu Saxla
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default PodcastManager;
