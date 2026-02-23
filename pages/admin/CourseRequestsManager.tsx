import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Search, BookOpen, Mail, MessageSquare, ListChecks } from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

type RequestType = 'course' | 'contact' | 'newsletter';

interface RequestItem {
  id: number | null;
  type: RequestType;
  email: string;
  fullName?: string;
  phone?: string;
  subject?: string;
  message?: string;
  courseId?: string;
  status: string;
  timestamp: string;
  createdAt?: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const CourseRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const { sitemap } = useSiteData();

  const loadRequests = async () => {
    const response = await fetch(`${API_BASE}/api/requests`);
    if (!response.ok) return;
    const payload = await response.json();
    setRequests(payload.requests || []);
  };

  useEffect(() => {
    void loadRequests();
  }, []);

  const getCourseTitle = (id: string) => sitemap.education.courses.find((c) => c.id === id)?.title || id;

  const handlePrimaryAction = async (req: RequestItem) => {
    if (req.type === 'course') {
      await fetch(`${API_BASE}/api/course-requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: req.email, courseId: req.courseId, status: 'approved' }),
      });
    } else if (req.id) {
      await fetch(`${API_BASE}/api/submissions/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
    }
    await loadRequests();
  };

  const handleDelete = async (req: RequestItem) => {
    if (!window.confirm('Bu müraciəti silmək istəyirsiniz?')) return;
    if (req.type === 'course') {
      await fetch(`${API_BASE}/api/course-requests`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: req.email, courseId: req.courseId }),
      });
    } else if (req.id) {
      await fetch(`${API_BASE}/api/submissions/${req.id}`, { method: 'DELETE' });
    }
    await loadRequests();
  };

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) =>
        [r.type, r.fullName, r.email, r.subject, r.message, r.courseId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [requests, searchTerm],
  );

  return (
    <div className="p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Müraciətlər</h1>
          <p className="text-slate-400 text-sm font-medium">Kurs, əlaqə və newsletter müraciətləri.</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Ad, email və ya mövzu axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-600"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-black tracking-widest">Növ</th>
              <th className="px-6 py-4 font-black tracking-widest">Müraciət</th>
              <th className="px-6 py-4 font-black tracking-widest">Məzmun</th>
              <th className="px-6 py-4 font-black tracking-widest">Tarix</th>
              <th className="px-6 py-4 font-black tracking-widest">Status</th>
              <th className="px-6 py-4 font-black tracking-widest text-right">İşləmlər</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-bold">
                  Heç bir müraciət tapılmadı.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const primaryDisabled = req.type === 'course' ? req.status === 'approved' : req.status === 'resolved';
                const typeLabel =
                  req.type === 'course' ? 'KURS' : req.type === 'contact' ? 'ƏLAQƏ' : 'NEWSLETTER';

                return (
                  <tr key={`${req.type}-${req.id || `${req.email}-${req.courseId || req.timestamp}`}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-black">
                        {req.type === 'course' ? <BookOpen size={14} /> : req.type === 'contact' ? <MessageSquare size={14} /> : <Mail size={14} />}
                        {typeLabel}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{req.fullName || 'Adsız'}</span>
                        <span className="text-slate-400 text-[10px]">{req.email || '-'}</span>
                        {req.phone ? <span className="text-slate-400 text-[10px]">{req.phone}</span> : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.type === 'course' ? (
                        <div className="font-medium">{getCourseTitle(String(req.courseId || ''))}</div>
                      ) : (
                        <div className="max-w-[340px]">
                          <p className="font-bold">{req.subject || 'Mövzu yoxdur'}</p>
                          {req.message ? <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{req.message}</p> : null}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{req.timestamp}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          req.status === 'approved' || req.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-[10px] font-black"
                          title="Detay"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => handlePrimaryAction(req)}
                          disabled={primaryDisabled}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title={req.type === 'course' ? 'Təsdiqlə' : 'Bağla'}
                        >
                          {req.type === 'course' ? <Check size={14} /> : <ListChecks size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(req)}
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-100 transition-colors rounded-lg"
                          title="Sil"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest ? (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Müraciət Detayı</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{selectedRequest.type}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Bağla"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Ad</p>
                <p className="font-bold text-slate-900">{selectedRequest.fullName || 'Adsız'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Email</p>
                <p className="font-bold text-slate-900">{selectedRequest.email || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Telefon</p>
                <p className="font-bold text-slate-900">{selectedRequest.phone || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Tarix</p>
                <p className="font-bold text-slate-900">{selectedRequest.timestamp}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Status</p>
                <p className="font-bold text-slate-900">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Növ</p>
                <p className="font-bold text-slate-900">{selectedRequest.type}</p>
              </div>

              {selectedRequest.courseId ? (
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Kurs</p>
                  <p className="font-bold text-slate-900">{getCourseTitle(selectedRequest.courseId)}</p>
                </div>
              ) : null}

              {selectedRequest.subject ? (
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Mövzu</p>
                  <p className="font-bold text-slate-900">{selectedRequest.subject}</p>
                </div>
              ) : null}

              {selectedRequest.message ? (
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Mesaj</p>
                  <p className="font-medium text-slate-700 whitespace-pre-wrap">{selectedRequest.message}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CourseRequestsManager;
