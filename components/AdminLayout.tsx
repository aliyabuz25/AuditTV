import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Mic,
  FileText,
  BookOpen,
  LogOut,
  PieChart,
  Settings,
  Shield,
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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';
const USER_KEY = 'audit_admin_user';
type MenuKey = 'pages' | 'podcast' | 'content' | 'system';
const SIDEBAR_ICON_SIZE = 18;
const SIDEBAR_LINK_BASE =
  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all';
const SIDEBAR_LINK_ACTIVE = 'bg-white text-[#0b1f4d] shadow-md shadow-slate-950/25';
const SIDEBAR_LINK_IDLE = 'text-slate-200 hover:bg-slate-700/35 hover:text-white';
const SIDEBAR_GROUP_BUTTON =
  'w-full px-2.5 py-1.5 text-[10px] font-extrabold text-slate-300 uppercase tracking-widest mb-0.5 mt-2 rounded-lg flex items-center justify-between bg-slate-800/20 hover:bg-slate-700/30 transition-colors';
const SIDEBAR_GROUP_PANEL =
  'ml-1.5 pl-2 border-l border-slate-600/40 space-y-0.5 overflow-hidden transition-all duration-200';
type PanelInfo = {
  brandName: string;
  subtitle: string;
  version: string;
};
const DEFAULT_PANEL_INFO: PanelInfo = {
  brandName: 'OctoAdmin',
  subtitle: 'admin panel sürümü',
  version: '0.0.0',
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoading, setAuthLoading] = useState(true);
  const [openMenus, setOpenMenus] = useState({
    pages: false,
    podcast: false,
    content: false,
    system: false,
  });
  const [panelInfo, setPanelInfo] = useState<PanelInfo>(DEFAULT_PANEL_INFO);
  const contentSections = useMemo(
    () => [
      { key: 'home', label: 'Ana Səhifə', Icon: House },
      { key: 'about', label: 'Haqqımızda', Icon: Users },
      { key: 'podcast', label: 'Podkast', Icon: Mic },
      { key: 'faq', label: 'Tez-tez Suallar', Icon: MessageSquareQuote },
      { key: 'contact', label: 'Əlaqə', Icon: Mail },
      { key: 'privacyPolicy', label: 'Məxfilik Siyasəti', Icon: Shield },
      { key: 'termsOfUse', label: 'İstifadə Şərtləri', Icon: FileText },
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

  useEffect(() => {
    const controller = new AbortController();
    const loadPanelInfo = async () => {
      try {
        const response = await fetch('/panel-info.json', { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        setPanelInfo({
          brandName: String(payload?.brandName || DEFAULT_PANEL_INFO.brandName),
          subtitle: String(payload?.subtitle || DEFAULT_PANEL_INFO.subtitle),
          version: String(payload?.version || DEFAULT_PANEL_INFO.version),
        });
      } catch {
        // Keep defaults if file is missing or invalid.
      }
    };
    void loadPanelInfo();
    return () => controller.abort();
  }, []);

  const resolveActiveMenu = (): MenuKey | null => {
    if (location.pathname.startsWith('/admin/content')) return 'pages';
    if (location.pathname === '/admin/podcast-stats' || location.pathname === '/admin/podcasts') return 'podcast';
    if (location.pathname === '/admin/blogs' || location.pathname === '/admin/education') return 'content';
    if (location.pathname === '/admin/settings' || location.pathname === '/admin/requests' || location.pathname === '/admin/users') return 'system';
    return null;
  };

  useEffect(() => {
    const active = resolveActiveMenu();
    if (!active) return;
    setOpenMenus({
      pages: active === 'pages',
      podcast: active === 'podcast',
      content: active === 'content',
      system: active === 'system',
    });
  }, [location.pathname, location.search]);

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

  const toggleMenu = (key: MenuKey) => {
    setOpenMenus((prev) => {
      const willOpen = !prev[key];
      if (!willOpen) {
        return { pages: false, podcast: false, content: false, system: false };
      }
      return {
        pages: key === 'pages',
        podcast: key === 'podcast',
        content: key === 'content',
        system: key === 'system',
      };
    });
  };

  if (authLoading) {
    return <div className="h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-black">Yoxlanılır...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans" style={{ fontFamily: "'Open Sans', Inter, sans-serif" }}>
      <aside className="relative w-64 border-r border-slate-800 bg-[#0b1f4d] flex flex-col flex-shrink-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="admin-sidebar-shape admin-sidebar-shape-a" />
          <div className="admin-sidebar-shape admin-sidebar-shape-b" />
          <div className="admin-sidebar-shape admin-sidebar-shape-c" />
        </div>

        <div className="relative z-10 h-16 flex items-center px-5 border-b border-slate-700/70">
          <div className="flex flex-col leading-tight">
            <div className="font-extrabold text-[16px] tracking-[0.04em] text-white">{panelInfo.brandName}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              {panelInfo.subtitle} v{panelInfo.version}
            </div>
          </div>
        </div>

        <nav className="relative z-10 admin-sidebar-scroll flex-1 p-3 space-y-0.5 overflow-y-auto">
          <button onClick={() => toggleMenu('pages')} className={SIDEBAR_GROUP_BUTTON} aria-expanded={openMenus.pages}>
            <span>Sayfalar</span>
            {openMenus.pages ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <div className={`${SIDEBAR_GROUP_PANEL} ${openMenus.pages ? 'max-h-[620px] opacity-100 pb-0.5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            {contentSections.map((section) => (
              <NavLink
                key={section.key}
                to={`/admin/content?section=${section.key}`}
                className={({ isActive }) => {
                  const selected = new URLSearchParams(location.search).get('section');
                  const active = isActive && (selected === section.key || (!selected && section.key === 'home'));
                  return `${SIDEBAR_LINK_BASE} ${
                    active ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE
                  }`;
                }}
              >
                <section.Icon size={SIDEBAR_ICON_SIZE} /> {section.label}
              </NavLink>
            ))}
          </div>

          <button onClick={() => toggleMenu('podcast')} className={SIDEBAR_GROUP_BUTTON} aria-expanded={openMenus.podcast}>
            <span>Podcast</span>
            {openMenus.podcast ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <div className={`${SIDEBAR_GROUP_PANEL} ${openMenus.podcast ? 'max-h-28 opacity-100 pb-0.5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <NavLink to="/admin/podcast-stats" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <PieChart size={SIDEBAR_ICON_SIZE} /> Analitika
            </NavLink>
            <NavLink to="/admin/podcasts" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <Mic size={SIDEBAR_ICON_SIZE} /> Epizodlar
            </NavLink>
          </div>

          <button onClick={() => toggleMenu('content')} className={SIDEBAR_GROUP_BUTTON} aria-expanded={openMenus.content}>
            <span>Məzmun</span>
            {openMenus.content ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <div className={`${SIDEBAR_GROUP_PANEL} ${openMenus.content ? 'max-h-28 opacity-100 pb-0.5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <NavLink to="/admin/blogs" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <FileText size={SIDEBAR_ICON_SIZE} /> Bloq
            </NavLink>
            <NavLink to="/admin/education" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <BookOpen size={SIDEBAR_ICON_SIZE} /> Tədris
            </NavLink>
          </div>

          <button onClick={() => toggleMenu('system')} className={SIDEBAR_GROUP_BUTTON} aria-expanded={openMenus.system}>
            <span>Sistem</span>
            {openMenus.system ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <div className={`${SIDEBAR_GROUP_PANEL} ${openMenus.system ? 'max-h-36 opacity-100 pb-0.5' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <NavLink to="/admin/settings" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <Settings size={SIDEBAR_ICON_SIZE} /> Footer
            </NavLink>
            <NavLink to="/admin/requests" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <Inbox size={SIDEBAR_ICON_SIZE} /> Müraciətlər
            </NavLink>
            <NavLink to="/admin/users" className={({isActive}) => `${SIDEBAR_LINK_BASE} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_IDLE}`}>
              <UserCog size={SIDEBAR_ICON_SIZE} /> Admin Hesabları
            </NavLink>
          </div>
        </nav>

        <div className="relative z-10 p-3 border-t border-slate-700/70">
          <button onClick={handleLogout} className="flex items-center gap-2 px-2.5 py-1.5 w-full rounded-lg text-[12.5px] font-semibold text-rose-200 hover:bg-rose-500/20 transition-colors">
            <LogOut size={SIDEBAR_ICON_SIZE} /> Çıxış
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
