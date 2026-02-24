
import React from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Linkedin, Instagram, Facebook, Share2 } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import { useToast } from '../components/ToastProvider';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const ContactPage: React.FC = () => {
  const { sitemap } = useSiteData();
  const toast = useToast();
  const { contact } = sitemap;

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get('fullName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!fullName || !email || !message) {
      toast.error('Ad, e-poçt və mesaj sahələri mütləqdir.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          fullName,
          email,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(String(payload.error || 'Mesaj göndərilmədi'));
      }

      toast.success('Mesajınız uğurla göndərildi. Tezliklə sizinlə əlaqə saxlayacağıq.');
      form.reset();
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : 'Mesaj göndərilərkən xəta baş verdi. Yenidən cəhd edin.';
      toast.error(message);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
           <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight break-words [overflow-wrap:anywhere]">{contact.pageTitle}</h1>
           <p className="text-slate-500 text-lg font-medium leading-relaxed break-words [overflow-wrap:anywhere]">
             {contact.pageDescription}
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 edu-card-shadow">
               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                     <MapPin size={28} />
                  </div>
                  <div className="min-w-0">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 break-words [overflow-wrap:anywhere]">{contact.officeTitle}</h4>
                     <p className="text-slate-900 font-black text-lg break-words [overflow-wrap:anywhere]">{contact.address}</p>
                     <p className="text-slate-500 font-medium break-words [overflow-wrap:anywhere]">{contact.officeSubtitle}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 edu-card-shadow">
               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                     <Phone size={28} />
                  </div>
                  <div className="min-w-0">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 break-words [overflow-wrap:anywhere]">{contact.callCenterTitle}</h4>
                     <p className="text-slate-900 font-black text-lg break-words [overflow-wrap:anywhere]">{contact.phone}</p>
                     <p className="text-slate-500 font-medium break-words [overflow-wrap:anywhere]">{contact.callCenterSubtitle}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 edu-card-shadow">
               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                     <Mail size={28} />
                  </div>
                  <div className="min-w-0">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 break-words [overflow-wrap:anywhere]">{contact.emailTitle}</h4>
                     <p className="text-slate-900 font-black text-lg break-words [overflow-wrap:anywhere]">{contact.email}</p>
                     <p className="text-slate-500 font-medium break-words [overflow-wrap:anywhere]">{contact.emailSubtitle}</p>
                  </div>
               </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 edu-card-shadow">
               <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                     <Share2 size={28} />
                  </div>
                  <div className="min-w-0">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 break-words [overflow-wrap:anywhere]">{contact.socialTitle}</h4>
                     <div className="flex gap-4">
                        <a href={contact.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-primary-600 hover:text-white hover:scale-110 transition-all duration-300">
                           <Linkedin size={20} />
                        </a>
                        <a href={contact.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-pink-600 hover:text-white hover:scale-110 transition-all duration-300">
                           <Instagram size={20} />
                        </a>
                        <a href={contact.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-blue-700 hover:text-white hover:scale-110 transition-all duration-300">
                           <Facebook size={20} />
                        </a>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white overflow-hidden relative shadow-2xl">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Clock size={120} />
               </div>
               <h4 className="text-xl font-black mb-4 flex items-center gap-2 break-words [overflow-wrap:anywhere]">
                 <MessageSquare size={20} className="text-primary-500" /> {contact.responseTitle}
               </h4>
               <p className="text-slate-400 leading-relaxed font-medium break-words [overflow-wrap:anywhere]">
                 {contact.responseTime} {contact.responseSuffix}
               </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 edu-card-shadow p-10 md:p-14">
             <h3 className="text-3xl font-black text-slate-900 mb-3 break-words [overflow-wrap:anywhere]">{contact.formTitle}</h3>
             <p className="text-slate-400 text-sm font-medium mb-10 break-words [overflow-wrap:anywhere]">{contact.formDescription}</p>
             <form onSubmit={handleContactSubmit} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tam Adınız</label>
                     <input name="fullName" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10 transition-all font-bold" placeholder="Məsələn: Orxan Əliyev" />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">E-poçt Ünvanı</label>
                     <input name="email" required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10 transition-all font-bold" placeholder="email@nümunə.com" />
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mövzu</label>
                  <select name="subject" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 transition-all font-bold appearance-none">
                     {contact.subjectOptions.map((option, index) => (
                       <option key={`${option}-${index}`}>{option}</option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Mesajınız</label>
                  <textarea name="message" required rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/10 transition-all font-bold" placeholder="Burada ətraflı məlumat yaza bilərsiniz..."></textarea>
               </div>

               <button type="submit" className="w-full py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-3">
                  Göndər <Send size={20} />
               </button>
             </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
