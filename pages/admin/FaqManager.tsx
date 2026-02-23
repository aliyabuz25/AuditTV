
import React, { useEffect, useState } from 'react';
import { Save, Plus, Trash2, MessageSquare, Check, HelpCircle } from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

const FaqManager: React.FC = () => {
  const { sitemap, saveSitemap } = useSiteData();
  const [faqs, setFaqs] = useState(sitemap.faq.faqs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFaqs(sitemap.faq.faqs);
  }, [sitemap.faq]);

  const handleSave = async () => {
    const ok = await saveSitemap({ ...sitemap, faq: { ...sitemap.faq, faqs } });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const addItem = () => {
    setFaqs([...faqs, { q: 'Yeni Sual?', a: 'Cavab yazın...' }]);
  };

  const removeItem = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'q' | 'a', value: string) => {
    const updated = faqs.map((item, i) => i === index ? { ...item, [field]: value } : item);
    setFaqs(updated);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">FAQ Meneceri</h1>
          <p className="text-slate-400 text-sm font-medium">Tez-tez verilən sualların idarəedilməsi</p>
        </div>
        <button onClick={handleSave} className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-primary-200">
          {saved ? <Check size={20} /> : <Save size={20} />} {saved ? "Yadda saxlanıldı" : "Saxla"}
        </button>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-10">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <HelpCircle size={16} className="text-primary-600" /> Suallar Siyahısı
           </h3>
           <button onClick={addItem} className="text-primary-600 font-black text-xs flex items-center gap-1 hover:underline">
              <Plus size={14} /> Yeni Sual Əlavə Et
           </button>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
               <button onClick={() => removeItem(idx)} className="absolute top-6 right-6 text-slate-300 hover:text-red-600 transition-colors">
                  <Trash2 size={20} />
               </button>
               <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Sual</label>
                    <input 
                      type="text" 
                      value={faq.q} 
                      onChange={e => updateItem(idx, 'q', e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900 focus:border-primary-600 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Cavab</label>
                    <textarea 
                      rows={3}
                      value={faq.a} 
                      onChange={e => updateItem(idx, 'a', e.target.value)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-600 focus:border-primary-600 outline-none" 
                    />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqManager;
