import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogIn, ChevronRight } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { sitemap } = useSiteData();
  const NAV_LINKS = sitemap.navLinks;
  const logoUrl = sitemap.settings?.branding?.logoUrl || '';
  const siteName = sitemap.settings?.branding?.siteName || 'audit.tv';
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 z-[60] w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-20 w-auto max-w-[280px] object-contain" />
            ) : null}
          </NavLink>

          <div className="hidden lg:flex items-center">
            <div className="flex items-center space-x-1 mr-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-bold transition-all relative ${
                      isActive
                        ? 'text-primary-600'
                        : 'text-slate-500 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-[-1.2rem] left-4 right-4 h-0.5 bg-primary-600 rounded-full animate-in fade-in duration-300"></span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <NavLink 
                to="/tedris" 
                className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                <LogIn size={18} />
                <span>Giriş</span>
              </NavLink>

              <NavLink 
                to="/elaqe"
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2 group"
              >
                <span>Əlaqə</span>
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </NavLink>
            </div>
          </div>

          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-slate-500 hover:text-slate-900"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-2xl pb-8 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-6 space-y-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-4 rounded-xl text-base font-bold transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3 px-4">
              <NavLink
                to="/tedris"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 py-2 text-slate-600 font-bold"
              >
                <LogIn size={20} /> Giriş
              </NavLink>
              <NavLink
                to="/elaqe"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-4 bg-primary-600 text-white rounded-xl font-bold"
              >
                Əlaqə
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
