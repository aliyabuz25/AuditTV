import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic,
  FileText,
  BookOpen,
  LogOut,
  PieChart,
  Settings,
  UserCog,
  House,
  Users,
  MessageSquareQuote,
  Mail,
  Navigation,
  Tags,
  Briefcase,
  Building2,
  Inbox,
} from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';
const USER_KEY = 'audit_admin_user';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const { sitemap } = useSiteData();
  const logoUrl = sitemap.settings?.branding?.logoUrl || '';
  const siteName = sitemap.settings?.branding?.siteName || 'audit.tv';
  const contentSections = useMemo(
    () => [
      { key: 'home', label: 'Ana Səhifə', Icon: House },
      { key: 'about', label: 'Haqqımızda', Icon: Users },
      { key: 'podcast', label: 'Podkast', Icon: Mic },
      { key: 'faq', label: 'Tez-tez Suallar', Icon: MessageSquareQuote },
      { key: 'contact', label: 'Əlaqə', Icon: Mail },
      { key: 'navLinks', label: 'Naviqasiya', Icon: Navigation },
      { key: 'settings', label: 'Sistem Ayarları', Icon: Settings },
      { key: 'topics', label: 'Mövzular', Icon: Tags },
      { key: 'services', label: 'Xidmətlər', Icon: Briefcase },
      { key: 'clients', label: 'Tərəfdaşlar', Icon: Building2 },
    ],
    [],
  );

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/admin');
      return;
    }

    const check = async () => {
      const response = await fetch(`${API_BASE}/api/admin/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        navigate('/admin');
        return;
      }
      setAuthLoading(false);
    };

    void check();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    navigate('/admin');
  };

  if (authLoading) {
    return <div className="h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-black">Yoxlanılır...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center font-black text-lg text-slate-900">
             {logoUrl ? (
               <img src={logoUrl} alt={siteName} className="h-8 w-auto max-w-[120px] object-contain" />
             ) : null}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sayfalar</div>
          {contentSections.map((section) => (
            <NavLink
              key={section.key}
              to={`/admin/content?section=${section.key}`}
              className={({ isActive }) => {
                const selected = new URLSearchParams(location.search).get('section');
                const active = isActive && (selected === section.key || (!selected && section.key === 'home'));
                return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`;
              }}
            >
              <section.Icon size={18} /> {section.label}
            </NavLink>
          ))}

          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-2">Podcast</div>
          <NavLink to="/admin/podcast-stats" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <PieChart size={18} /> Analitika
          </NavLink>
          <NavLink to="/admin/podcasts" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Mic size={18} /> Epizodlar
          </NavLink>

          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-2">Məzmun</div>
          <NavLink to="/admin/blogs" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FileText size={18} /> Bloq
          </NavLink>
          <NavLink to="/admin/education" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <BookOpen size={18} /> Tədris
          </NavLink>

          <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-2">Sistem</div>
          <NavLink to="/admin/settings" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Settings size={18} /> Footer
          </NavLink>
          <NavLink to="/admin/requests" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Inbox size={18} /> Müraciətlər
          </NavLink>
          <NavLink to="/admin/users" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <UserCog size={18} /> Admin Hesabları
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} /> Çıxış
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10">
        <div className="max-w-5xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
