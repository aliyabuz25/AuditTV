import React, { useEffect, useState } from 'react';
import { Plus, Save, Shield, Trash2, UserCog } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';

type AdminUser = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  isActive: number;
  createdAt: string;
};

const AdminUsersManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', displayName: '', role: 'admin' });

  const token = localStorage.getItem(TOKEN_KEY) || '';

  const request = async (url: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    const response = await request('/api/admin/users');
    if (!response.ok) {
      setError('Admin user listəsi alınmadı.');
      setLoading(false);
      return;
    }
    const payload = await response.json();
    setUsers(payload.users || []);
    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const createUser = async () => {
    if (!newUser.username || !newUser.password) {
      setError('Username və password tələb olunur.');
      return;
    }

    setCreating(true);
    setError('');
    const response = await request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(newUser),
    });
    setCreating(false);

    if (!response.ok) {
      setError('Yeni admin yaradılmadı. Username mövcud ola bilər.');
      return;
    }

    setNewUser({ username: '', password: '', displayName: '', role: 'admin' });
    await loadUsers();
  };

  const updateUser = async (user: AdminUser, updates: Partial<{ displayName: string; role: string; isActive: boolean; password: string }>) => {
    const response = await request(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (response.ok) await loadUsers();
  };

  const deleteUser = async (user: AdminUser) => {
    if (!window.confirm(`${user.username} hesabını silmək istəyirsiniz?`)) return;
    const response = await request(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (response.ok) await loadUsers();
  };

  return (
    <div className="space-y-10 pb-24">
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Hesabları</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">SQLite üzərindən hesab idarəetməsi</p>
        </div>
      </header>

      {error ? <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-bold">{error}</div> : null}

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><Plus size={14} className="text-primary-600" /> Yeni Admin</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="Username" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Password" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          <input value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} placeholder="Display Name" className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium">
            <option value="admin">admin</option>
            <option value="editor">editor</option>
            <option value="super_admin">super_admin</option>
          </select>
        </div>

        <button onClick={createUser} disabled={creating} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-black text-sm flex items-center gap-2 disabled:opacity-60">
          <Plus size={16} /> {creating ? 'Yaradılır...' : 'Admin Yarat'}
        </button>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2"><UserCog size={14} className="text-primary-600" /> Mövcud Hesablar</h3>

        {loading ? (
          <div className="text-slate-500 font-bold">Yüklənir...</div>
        ) : users.length === 0 ? (
          <div className="text-slate-500 font-bold">Admin hesabı tapılmadı.</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="font-black text-slate-900">{user.username} <span className="text-slate-400 text-xs">({user.role})</span></div>
                    <div className="text-xs text-slate-500">{user.displayName || '-'} • {user.isActive ? 'active' : 'inactive'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateUser(user, { isActive: !user.isActive })} className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-black">
                      {user.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteUser(user)} className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-black flex items-center gap-1">
                      <Trash2 size={14} /> Sil
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input defaultValue={user.displayName || ''} placeholder="Display Name" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" onBlur={(e) => updateUser(user, { displayName: e.target.value })} />
                  <select defaultValue={user.role} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" onChange={(e) => updateUser(user, { role: e.target.value })}>
                    <option value="admin">admin</option>
                    <option value="editor">editor</option>
                    <option value="super_admin">super_admin</option>
                  </select>
                  <input type="password" placeholder="Yeni şifrə" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value;
                      if (value) void updateUser(user, { password: value });
                    }
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminUsersManager;
