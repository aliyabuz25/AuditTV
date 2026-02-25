import React, { useState } from 'react';
import { Mic, Play, Clock, Calendar, Headphones, Search, X } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import CsPlayerEmbed, { getYouTubeVideoId } from '../components/CsPlayerEmbed';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';

const PodcastPage: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const { sitemap } = useSiteData();
  const PODCAST_EPISODES = sitemap.podcast.episodes;

  const filteredEpisodes = PODCAST_EPISODES.filter(ep => 
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ep.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeEpisode = PODCAST_EPISODES.find((ep) => ep.id === activeEpisodeId) || null;
  const activeYouTubeId = getYouTubeVideoId(activeEpisode?.videoUrl);

  const trackPlay = async (episodeId: string) => {
    if (!episodeId) return;
    const key = 'audit_podcast_session_id';
    let sessionId = localStorage.getItem(key) || '';
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(key, sessionId);
    }
    try {
      await fetch(`${API_BASE}/api/podcast-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId, eventType: 'play', sessionId }),
      });
    } catch {
      // Analytics failure should never block playback UX.
    }
  };

  const openEpisode = (episodeId: string) => {
    setActiveEpisodeId(episodeId);
    void trackPlay(episodeId);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl w-full">
              <div className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-[10px] mb-4">
                 <Mic size={16} /> {sitemap.podcast.pageHeader.badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">{sitemap.podcast.pageHeader.title}</h1>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">{sitemap.podcast.pageHeader.description}</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Epizod axtarışı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/5 transition-all font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
             Son Epizodlar <span className="text-slate-300 font-medium">({filteredEpisodes.length})</span>
          </h2>
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
                <Headphones size={16} /> Spotify-da Dinlə
             </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredEpisodes.map(episode => (
            <div key={episode.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:edu-card-shadow transition-all duration-300 flex flex-col">
               <button className="aspect-video relative overflow-hidden text-left" onClick={() => openEpisode(episode.id)}>
                  <ImageWithPlaceholder
                    src={episode.thumbnailUrl}
                    alt={episode.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    placeholderClassName="bg-slate-100"
                    placeholderText="Görsel seçilməyib"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl">
                        <Play className="text-primary-600 ml-1" size={24} fill="currentColor" />
                     </div>
                  </div>
               </button>
               <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                     <span className="flex items-center gap-1"><Calendar size={12} /> {episode.date}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                     <span className="flex items-center gap-1"><Clock size={12} /> {episode.duration}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight">
                    {episode.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6 flex-1">
                    {episode.description}
                  </p>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-end">
                     <button className="text-primary-600 font-black text-sm flex items-center gap-2" onClick={() => openEpisode(episode.id)}>
                        İndi Dinlə <Play size={14} fill="currentColor" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {activeEpisode ? (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md p-4 md:p-8">
          <div className="max-w-5xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">{activeEpisode.title}</h3>
              </div>
              <button onClick={() => setActiveEpisodeId(null)} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 md:p-6 bg-slate-100">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-black/90">
                {activeYouTubeId ? (
                  <CsPlayerEmbed videoId={activeYouTubeId} autoplay={true} />
                ) : activeEpisode.videoUrl ? (
                  <video className="w-full aspect-video" src={activeEpisode.videoUrl} controls autoPlay />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center text-slate-200 font-bold">
                    Video linki mövcud deyil.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PodcastPage;
