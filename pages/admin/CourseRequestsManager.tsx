import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Search, BookOpen, Mail, MessageSquare, ListChecks, Download, CircleOff } from 'lucide-react';
import * as XLSX from 'xlsx';
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
  courseTitle?: string;
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

  const resolveCourseTitle = (item: Pick<RequestItem, 'courseId' | 'courseTitle'>) => {
    const fromApi = String(item.courseTitle || '').trim();
    if (fromApi) return fromApi;
    const id = String(item.courseId || '').trim();
    if (!id) return '-';
    return sitemap.education.courses.find((c) => String(c.id) === id)?.title || id;
  };

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

  const handleRejectAction = async (req: RequestItem) => {
    if (req.type === 'course') {
      await fetch(`${API_BASE}/api/course-requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: req.email, courseId: req.courseId, status: 'rejected' }),
      });
    } else if (req.id) {
      await fetch(`${API_BASE}/api/submissions/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
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
        [r.type, r.fullName, r.email, r.subject, r.message, r.courseId, r.courseTitle]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      ),
    [requests, searchTerm],
  );

  const handleExportExcel = () => {
    const toTypeLabel = (type: RequestType) => {
      if (type === 'course') return 'Kurs';
      if (type === 'contact') return 'Əlaqə';
      return 'Newsletter';
    };

    const toStatusLabel = (status: string) => {
      if (status === 'approved') return 'Təsdiqləndi';
      if (status === 'resolved') return 'Bağlandı';
      if (status === 'rejected') return 'Rədd edildi';
      return 'Gözləmədə';
    };

    const reportDate = new Date();
    const shortText = (value?: string, max = 220) => {
      const normalized = String(value || '').replace(/\s+/g, ' ').trim();
      if (!normalized) return '';
      return normalized.length > max ? `${normalized.slice(0, max - 1)}…` : normalized;
    };

    const rows = filteredRequests.map((req, index) => ({
      No: index + 1,
      'Müraciət Növü': toTypeLabel(req.type),
      'Ad Soyad': req.fullName || 'Adsız',
      'E-poçt': req.email || '',
      GSM: req.phone || '',
      'Mövzu / Kurs': req.type === 'course' ? resolveCourseTitle(req) : req.subject || '',
      'Mesaj (Qısa)': shortText(req.message),
      Status: toStatusLabel(req.status || ''),
      'Müraciət Tarixi': req.timestamp || '',
    }));

    const worksheet = XLSX.utils.aoa_to_sheet([
      ['audit.tv | Müraciətlər Hesabatı'],
      [`Hesabat tarixi: ${reportDate.toLocaleDateString('az-AZ')} ${reportDate.toLocaleTimeString('az-AZ')}`],
      [`Qeyd sayı: ${rows.length}`],
      [],
    ]);
    XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A5', skipHeader: false });

    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
    worksheet['!autofilter'] = { ref: `A5:I${Math.max(rows.length + 5, 6)}` };
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 14 }, // Müraciət Növü
      { wch: 24 }, // Ad Soyad
      { wch: 30 }, // E-poçt
      { wch: 18 }, // GSM
      { wch: 34 }, // Mövzu / Kurs
      { wch: 52 }, // Mesaj (Qısa)
      { wch: 16 }, // Status
      { wch: 24 }, // Müraciət Tarixi
    ];

    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: 'audit.tv Müraciətlər Hesabatı',
      Subject: 'Müraciətlərin Excel ixracı',
      Author: 'audit.tv Admin Panel',
      Company: 'audit.tv',
      CreatedDate: reportDate,
    };
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Muraciatlar');
    XLSX.writeFile(workbook, `muracietler-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Müraciətlər</h1>
          <p className="text-slate-400 text-sm font-medium">Kurs, əlaqə və newsletter müraciətləri.</p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3 md:items-center">
          <button
            onClick={handleExportExcel}
            disabled={filteredRequests.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Excel-ə Yüklə
          </button>
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
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-xs">
          <thead className="text-[10px] uppercase bg-slate-50 text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-4 py-4 font-black tracking-widest whitespace-nowrap">Növ</th>
              <th className="px-4 py-4 font-black tracking-widest whitespace-nowrap">Müraciət</th>
              <th className="px-4 py-4 font-black tracking-widest whitespace-nowrap">Məzmun</th>
              <th className="px-4 py-4 font-black tracking-widest whitespace-nowrap">Tarix</th>
              <th className="px-4 py-4 font-black tracking-widest whitespace-nowrap">Status</th>
              <th className="px-4 py-4 font-black tracking-widest text-right whitespace-nowrap">İşləmlər</th>
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
                const rejectDisabled = req.status === 'rejected';
                const typeLabel =
                  req.type === 'course' ? 'KURS' : req.type === 'contact' ? 'ƏLAQƏ' : 'NEWSLETTER';

                return (
                  <tr key={`${req.type}-${req.id || `${req.email}-${req.courseId || req.timestamp}`}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-black">
                        {req.type === 'course' ? <BookOpen size={14} /> : req.type === 'contact' ? <MessageSquare size={14} /> : <Mail size={14} />}
                        {typeLabel}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">{req.fullName || 'Adsız'}</span>
                        <span className="text-slate-400 text-[10px]">{req.email || '-'}</span>
                        {req.phone ? <span className="text-slate-400 text-[10px]">{req.phone}</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {req.type === 'course' ? (
                        <div className="font-medium">{resolveCourseTitle(req)}</div>
                      ) : (
                        <div className="max-w-[340px]">
                          <p className="font-bold">{req.subject || 'Mövzu yoxdur'}</p>
                          {req.message ? <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">{req.message}</p> : null}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400 whitespace-nowrap">{req.timestamp}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          req.status === 'approved' || req.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : req.status === 'rejected'
                              ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
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
                          onClick={() => handleRejectAction(req)}
                          disabled={rejectDisabled}
                          className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Rədd et"
                        >
                          <CircleOff size={14} />
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
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
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

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm overflow-y-auto">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Ad</p>
                <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{selectedRequest.fullName || 'Adsız'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Email</p>
                <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{selectedRequest.email || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Telefon</p>
                <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{selectedRequest.phone || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Tarix</p>
                <p className="font-bold text-slate-900">{selectedRequest.timestamp}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Status</p>
                <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{selectedRequest.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Növ</p>
                <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{selectedRequest.type}</p>
              </div>

              {selectedRequest.courseId ? (
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Kurs</p>
                  <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{resolveCourseTitle(selectedRequest)}</p>
                </div>
              ) : null}

              {selectedRequest.subject ? (
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Mövzu</p>
                  <p className="font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{selectedRequest.subject}</p>
                </div>
              ) : null}

              {selectedRequest.message ? (
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-wider font-black text-slate-400 mb-1">Mesaj</p>
                  <p className="font-medium text-slate-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{selectedRequest.message}</p>
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
