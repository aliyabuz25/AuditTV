import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Users, Headphones, ChevronDown, Mic, Clock, Video } from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

function parseMinutes(duration?: string): number {
  if (!duration) return 0;
  const raw = String(duration).trim();
  const hhmmss = raw.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if (hhmmss) {
    if (hhmmss[3] !== undefined) {
      const h = Number(hhmmss[1] || 0);
      const m = Number(hhmmss[2] || 0);
      const s = Number(hhmmss[3] || 0);
      return h * 60 + m + Math.round(s / 60);
    }
    const m = Number(hhmmss[1] || 0);
    const s = Number(hhmmss[2] || 0);
    return m + Math.round(s / 60);
  }
  const m = raw.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

const PodcastDashboard: React.FC = () => {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const TOKEN_KEY = 'audit_admin_token';
  const [timeRange, setTimeRange] = useState('Son 30 gün');
  const [activeTab, setActiveTab] = useState<'overall' | 'podcast'>('overall');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const { sitemap } = useSiteData();
  const episodes = sitemap.podcast.episodes || [];

  const rangeKey = useMemo(() => {
    if (timeRange === 'Son 7 gün') return '7d';
    if (timeRange === 'Bu il') return 'year';
    return '30d';
  }, [timeRange]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/admin/podcast-analytics?range=${rangeKey}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('analytics_failed');
        const payload = await response.json();
        if (!cancelled) setAnalytics(payload);
      } catch {
        if (!cancelled) setAnalytics(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, rangeKey]);

  const stats = useMemo(() => {
    if (analytics?.totals) {
      return {
        totalEpisodes: Number(analytics.totals.totalEpisodes || 0),
        totalMinutes: Number(analytics.totals.totalMinutes || 0),
        avgDuration: Number(analytics.totals.avgDuration || 0),
        uniqueHosts: Number(analytics.totals.uniqueHosts || 0),
        videoReady: Number(analytics.totals.videoReady || 0),
        totalPlays: Number(analytics.totals.totalPlays || 0),
        hostDistribution: Array.isArray(analytics.hostDistribution) ? analytics.hostDistribution : [],
        topEpisodes: Array.isArray(analytics.topEpisodes) ? analytics.topEpisodes : [],
      };
    }
    const totalEpisodes = episodes.length;
    const totalMinutes = episodes.reduce((acc, ep) => acc + parseMinutes(ep.duration), 0);
    const avgDuration = totalEpisodes ? Math.round(totalMinutes / totalEpisodes) : 0;
    const uniqueHosts = new Set(episodes.map((ep) => ep.host).filter(Boolean)).size;
    const videoReady = episodes.filter((ep) => ep.videoUrl).length;

    const hostMap = new Map<string, number>();
    episodes.forEach((ep) => {
      const key = ep.host || 'Naməlum';
      hostMap.set(key, (hostMap.get(key) || 0) + 1);
    });

    const hostDistribution = Array.from(hostMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalEpisodes ? Math.round((count / totalEpisodes) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topEpisodes = [...episodes]
      .map((ep) => ({ ...ep, minutes: parseMinutes(ep.duration) }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    return {
      totalEpisodes,
      totalMinutes,
      avgDuration,
      uniqueHosts,
      videoReady,
      totalPlays: 0,
      hostDistribution,
      topEpisodes,
    };
  }, [analytics, episodes]);

  const overviewCards = [
    { label: 'Epizod Sayı', value: String(stats.totalEpisodes), icon: Mic, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Ümumi Müddət', value: `${stats.totalMinutes} dəq`, icon: Headphones, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Orta Müddət', value: `${stats.avgDuration} dəq`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Dinlənmə', value: String(stats.totalPlays), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const podcastCards = [
    { label: 'Video Hazır Epizod', value: String(stats.videoReady), icon: Video, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Video Olmayan', value: String(Math.max(stats.totalEpisodes - stats.videoReady, 0)), icon: Mic, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Toplam Epizod', value: String(stats.totalEpisodes), icon: Headphones, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Orta Müddət', value: `${stats.avgDuration} dəq`, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const activeCards = activeTab === 'podcast' ? podcastCards : overviewCards;

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10 gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Podcast Analitika</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Metriklər real dinlənmə eventləri və epizod datasından hesablanır</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
            {['overall', 'podcast'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'overall' | 'podcast')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {tab === 'overall' ? 'Cəmi' : 'Podcast'}
              </button>
            ))}
          </div>
          <div className="relative group">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-2xl px-6 py-3.5 pr-12 text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:border-primary-600 transition-all cursor-pointer shadow-sm"
            >
              <option>Son 7 gün</option>
              <option>Son 30 gün</option>
              <option>Bu il</option>
            </select>
            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeCards.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <div className="text-3xl font-black text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      {loading ? <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Analitika yenilənir...</p> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-10 flex items-center gap-3">
            <TrendingUp className="text-primary-600" /> Ən Çox Dinlənən Epizodlar
          </h3>
          <div className="space-y-6">
            {stats.topEpisodes.map((episode, idx) => (
              <div key={episode.id} className="flex items-center gap-6 p-5 bg-slate-50 rounded-[2rem] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 font-black text-lg border border-slate-100 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-900 text-sm truncate">{episode.title}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">{episode.host}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs font-black text-slate-900">{episode.duration || `${episode.minutes} dəq`}</div>
                  <div className="text-[10px] font-bold text-emerald-500">{episode.date}</div>
                </div>
              </div>
            ))}
            {stats.topEpisodes.length === 0 ? <p className="text-slate-400 font-bold">Epizod yoxdur.</p> : null}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <BarChart3 size={120} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-10 text-primary-400">Host Paylanması</h3>
            <div className="space-y-10 relative z-10">
              {stats.hostDistribution.map((h) => (
                <div key={h.name} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>{h.name}</span>
                    <span>{h.percentage}% ({h.plays ?? h.count ?? 0})</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="bg-primary-600 h-full transition-all duration-1000" style={{ width: `${h.percentage}%` }}></div>
                  </div>
                </div>
              ))}
              {stats.hostDistribution.length === 0 ? <p className="text-slate-400 text-sm font-bold">Host datası yoxdur.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDashboard;
