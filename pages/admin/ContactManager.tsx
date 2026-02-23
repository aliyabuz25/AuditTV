
import React, { useEffect, useState } from 'react';
import { Save, MapPin, Phone, Mail, Clock, Share2 } from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';

const ContactManager: React.FC = () => {
  const { sitemap, saveSection } = useSiteData();
  const [contact, setContact] = useState(sitemap.contact);

  useEffect(() => {
    setContact(sitemap.contact);
  }, [sitemap.contact]);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Əlaqə İdarəetməsi</h1>
          <p className="text-slate-400 text-sm font-medium">Əlaqə vasitələri və sosial media</p>
        </div>
        <button onClick={async () => { await saveSection('contact', contact); }} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
          <Save size={18} /> Yadda saxla
        </button>
      </header>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={14} className="text-primary-600" /> Ünvan
               </label>
               <input 
                  type="text" 
                  value={contact.address}
                  onChange={(e) => setContact({...contact, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none" 
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Phone size={14} className="text-emerald-600" /> Telefon
               </label>
               <input 
                  type="text" 
                  value={contact.phone}
                  onChange={(e) => setContact({...contact, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none" 
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Mail size={14} className="text-amber-600" /> E-poçt
               </label>
               <input 
                  type="email" 
                  value={contact.email}
                  onChange={(e) => setContact({...contact, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none" 
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-slate-900" /> Cavab Vaxtı Mətni
               </label>
               <input 
                  type="text" 
                  value={contact.responseTime}
                  onChange={(e) => setContact({...contact, responseTime: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none" 
               />
            </div>
         </div>
      </div>
    </div>
  );
};

export default ContactManager;
