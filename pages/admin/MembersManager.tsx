import React from 'react';
import { Users, Mail, Calendar, Download, Search, Trash2, Filter } from 'lucide-react';

const MEMBERS = [
  { id: 1, email: 'leyla.mammadova@example.com', date: '20 Noyabr 2025', status: 'Aktiv' },
  { id: 2, email: 'rasim.aliyev@company.az', date: '19 Noyabr 2025', status: 'Aktiv' },
  { id: 3, email: 'info@startuplab.az', date: '18 Noyabr 2025', status: 'Aktiv' },
  { id: 4, email: 'hesabat@audit.az', date: '15 Noyabr 2025', status: 'Ləğv edilib' },
  { id: 5, email: 'kamran.veliyev@bank.az', date: '12 Noyabr 2025', status: 'Aktiv' },
  { id: 6, email: 'aygun.k@holding.com', date: '10 Noyabr 2025', status: 'Aktiv' },
];

const MembersManager: React.FC = () => {
  return (
    <div className="p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Üzvlər və Abunəçilər</h1>
          <p className="text-slate-400 text-sm font-medium">Bülletenə abunə olan 1,245 istifadəçi</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <input type="text" placeholder="Email axtar..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-600" />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
           </div>
           <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
             <Download size={18} className="text-slate-400" /> Export
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
             <Users size={24} />
           </div>
           <div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Ümumi Abunəçi</p>
             <p className="text-2xl font-black text-slate-900">1,245</p>
           </div>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
             <Mail size={24} />
           </div>
           <div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Aktiv Email</p>
             <p className="text-2xl font-black text-slate-900">1,102</p>
           </div>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
             <Calendar size={24} />
           </div>
           <div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Son 30 gün</p>
             <p className="text-2xl font-black text-slate-900">+124</p>
           </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-black tracking-widest">Email Ünvanı</th>
              <th className="px-6 py-4 font-black tracking-widest">Qoşulma Tarixi</th>
              <th className="px-6 py-4 font-black tracking-widest">Status</th>
              <th className="px-6 py-4 font-black tracking-widest text-right">İdarə</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MEMBERS.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                      <Mail size={14} />
                    </div>
                    <span className="font-bold text-slate-700">{member.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">{member.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tight ${
                    member.status === 'Aktiv' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {member.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                     <Trash2 size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MembersManager;