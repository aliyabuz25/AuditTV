import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';
import { useToast } from '../../components/ToastProvider';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';
const USER_KEY = 'audit_admin_user';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { sitemap } = useSiteData();
  const logoUrl = sitemap.settings?.branding?.logoUrl || '';
  const siteName = sitemap.settings?.branding?.siteName || 'audit.tv';
  const toast = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) navigate('/admin/dashboard');
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (!response.ok) {
      const message = 'İstifadəçi adı və ya şifrə yanlışdır.';
      setError(message);
      toast.error(message);
      return;
    }

    const payload = await response.json();
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user || {}));
    toast.success('Admin girişi uğurla tamamlandı.');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
           <div className="inline-flex items-center mb-6">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-12 w-auto max-w-[160px] object-contain" />
              ) : null}
           </div>
           <h2 className="text-2xl font-black text-slate-900">İdarəetmə Paneli</h2>
           <p className="text-slate-400 font-medium mt-2">SQLite admin hesabı ilə giriş</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
          {error ? <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm font-bold">{error}</div> : null}
          <form onSubmit={handleLogin} className="space-y-4">
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
            <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3 disabled:opacity-60">
              {loading ? 'Giriş edilir...' : <>Giriş Et <LogIn size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
