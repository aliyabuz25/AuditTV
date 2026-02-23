import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, FileText, Loader2, Upload } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';

type UploadedPdf = {
  name: string;
  url: string;
  absoluteUrl?: string;
  size: number;
  uploadedAt: string;
};

const humanFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const PdfUploadManager: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<UploadedPdf[]>([]);

  const latest = history[0];
  const acceptText = useMemo(() => 'Yalnız PDF faylı seçin (.pdf)', []);

  const isPdf = (candidate: File) =>
    candidate.type === 'application/pdf' || candidate.name.toLowerCase().endsWith('.pdf');

  const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0] || null;
    setError('');
    if (!picked) {
      setFile(null);
      return;
    }
    if (!isPdf(picked)) {
      setFile(null);
      setError(acceptText);
      return;
    }
    setFile(picked);
  };

  const uploadPdf = async () => {
    if (!file) {
      setError('PDF faylı seçilməyib.');
      return;
    }

    if (!isPdf(file)) {
      setError(acceptText);
      return;
    }

    setUploading(true);
    setError('');
    setCopied(false);
    try {
      const token = localStorage.getItem(TOKEN_KEY) || '';
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(String(body.error || 'PDF yükləmə alınmadı.'));
      }

      const payload = await response.json();
      const next: UploadedPdf = {
        name: String(payload.filename || file.name),
        url: String(payload.url || ''),
        absoluteUrl: String(payload.absoluteUrl || ''),
        size: Number(payload.size || file.size || 0),
        uploadedAt: new Date().toISOString(),
      };

      setHistory((prev) => [next, ...prev].slice(0, 8));
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF yükləmə xətası');
    } finally {
      setUploading(false);
    }
  };

  const copyLatestUrl = async () => {
    if (!latest?.url) return;
    await navigator.clipboard.writeText(latest.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-10 pb-24">
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">PDF Yükləmə</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Admin paneldən birbaşa PDF yüklə</p>
        </div>
      </header>

      {error ? <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm font-bold">{error}</div> : null}

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <Upload size={14} className="text-primary-600" /> Yeni PDF Yüklə
        </h3>

        <div className="space-y-4">
          <label className="w-full block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer hover:border-primary-500 transition-colors">
            <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={onPickFile} />
            <div className="flex flex-col items-center gap-3">
              <FileText size={34} className="text-slate-500" />
              <div className="text-sm font-black text-slate-700">{file ? file.name : 'PDF seçmək üçün klik et'}</div>
              <div className="text-xs font-bold text-slate-400">{acceptText}</div>
            </div>
          </label>

          <button
            type="button"
            onClick={uploadPdf}
            disabled={uploading || !file}
            className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-widest disabled:opacity-60 flex items-center gap-2"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Yüklənir...' : 'PDF Yüklə'}
          </button>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
          <FileText size={14} className="text-primary-600" /> Son Yüklənən PDF
        </h3>

        {!latest ? (
          <div className="text-sm font-bold text-slate-500">Hələ PDF yüklənməyib.</div>
        ) : (
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50">
            <div className="text-sm font-black text-slate-900">{latest.name}</div>
            <div className="text-xs font-medium text-slate-500">Ölçü: {humanFileSize(latest.size)}</div>
            <div className="flex flex-wrap gap-2">
              <input
                readOnly
                value={latest.url}
                className="flex-1 min-w-[260px] bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700"
              />
              <button
                type="button"
                onClick={() => void copyLatestUrl()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Kopyalandı' : 'URL Kopyala'}
              </button>
              <a
                href={latest.absoluteUrl || latest.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest flex items-center gap-2"
              >
                <ExternalLink size={14} /> Aç
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PdfUploadManager;
