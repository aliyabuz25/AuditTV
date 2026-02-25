import React, { useEffect, useState } from 'react';
import { Save, MapPin, Phone, Mail, Clock, Share2, Type, Check, Plus, Trash2 } from 'lucide-react';
import { useSiteData } from '../../site/SiteDataContext';
import type { Sitemap } from '../../site/defaultSitemap';

const DEFAULT_FORM_FIELDS: Sitemap['contact']['formFields'] = {
  fullNameLabel: 'Tam Adınız',
  fullNamePlaceholder: 'Məsələn: Orxan Əliyev',
  emailLabel: 'E-poçt Ünvanı',
  emailPlaceholder: 'email@nümunə.com',
  phoneLabel: 'GSM Nömrəsi',
  phonePlaceholder: '+994 50 123 45 67',
  subjectLabel: 'Mövzu',
  messageLabel: 'Mesajınız',
  messagePlaceholder: 'Burada ətraflı məlumat yaza bilərsiniz...',
  submitButtonText: 'Göndər',
};

function normalizeContact(contact: Sitemap['contact']): Sitemap['contact'] {
  return {
    ...contact,
    formFields: {
      ...DEFAULT_FORM_FIELDS,
      ...(contact.formFields || {}),
    },
    subjectOptions: Array.isArray(contact.subjectOptions) ? contact.subjectOptions : [],
  };
}

const ContactManager: React.FC = () => {
  const { sitemap, saveSection } = useSiteData();
  const [contact, setContact] = useState<Sitemap['contact']>(normalizeContact(sitemap.contact));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setContact(normalizeContact(sitemap.contact));
  }, [sitemap.contact]);

  const handleSave = async () => {
    const ok = await saveSection('contact', contact);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const updateFormField = <K extends keyof Sitemap['contact']['formFields']>(
    key: K,
    value: Sitemap['contact']['formFields'][K],
  ) => {
    setContact((prev) => ({
      ...prev,
      formFields: {
        ...prev.formFields,
        [key]: value,
      },
    }));
  };

  const updateSubjectOption = (index: number, value: string) => {
    setContact((prev) => ({
      ...prev,
      subjectOptions: prev.subjectOptions.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const addSubjectOption = () => {
    setContact((prev) => ({
      ...prev,
      subjectOptions: [...prev.subjectOptions, 'Yeni mövzu'],
    }));
  };

  const removeSubjectOption = (index: number) => {
    setContact((prev) => ({
      ...prev,
      subjectOptions: prev.subjectOptions.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Əlaqə İdarəetməsi</h1>
          <p className="text-slate-400 text-sm font-medium">Əlaqə səhifəsi və form parametrləri</p>
        </div>
        <button onClick={handleSave} className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg">
          {saved ? <Check size={18} /> : <Save size={18} />} {saved ? 'Yadda saxlanıldı' : 'Yadda saxla'}
        </button>
      </header>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Səhifə Başlığı</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Səhifə Başlığı</label>
            <input
              type="text"
              value={contact.pageTitle}
              onChange={(e) => setContact({ ...contact, pageTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Səhifə Açıqlaması</label>
            <textarea
              rows={3}
              value={contact.pageDescription}
              onChange={(e) => setContact({ ...contact, pageDescription: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Əlaqə Kartları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-primary-600" /> Ünvan
            </label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ofis Başlığı</label>
            <input
              type="text"
              value={contact.officeTitle}
              onChange={(e) => setContact({ ...contact, officeTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ofis Alt Mətn</label>
            <input
              type="text"
              value={contact.officeSubtitle}
              onChange={(e) => setContact({ ...contact, officeSubtitle: e.target.value })}
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
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Zəng Mərkəzi Başlığı</label>
            <input
              type="text"
              value={contact.callCenterTitle}
              onChange={(e) => setContact({ ...contact, callCenterTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Zəng Mərkəzi Alt Mətn</label>
            <input
              type="text"
              value={contact.callCenterSubtitle}
              onChange={(e) => setContact({ ...contact, callCenterSubtitle: e.target.value })}
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
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">E-poçt Başlığı</label>
            <input
              type="text"
              value={contact.emailTitle}
              onChange={(e) => setContact({ ...contact, emailTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">E-poçt Alt Mətn</label>
            <input
              type="text"
              value={contact.emailSubtitle}
              onChange={(e) => setContact({ ...contact, emailSubtitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Type size={14} className="text-primary-600" /> Form Mətni və Sahələri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Form Başlığı</label>
            <input
              type="text"
              value={contact.formTitle}
              onChange={(e) => setContact({ ...contact, formTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Form Açıqlaması</label>
            <textarea
              rows={2}
              value={contact.formDescription}
              onChange={(e) => setContact({ ...contact, formDescription: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ad Label</label>
            <input
              type="text"
              value={contact.formFields.fullNameLabel}
              onChange={(e) => updateFormField('fullNameLabel', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ad Placeholder</label>
            <input
              type="text"
              value={contact.formFields.fullNamePlaceholder}
              onChange={(e) => updateFormField('fullNamePlaceholder', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Label</label>
            <input
              type="text"
              value={contact.formFields.emailLabel}
              onChange={(e) => updateFormField('emailLabel', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Placeholder</label>
            <input
              type="text"
              value={contact.formFields.emailPlaceholder}
              onChange={(e) => updateFormField('emailPlaceholder', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefon Label</label>
            <input
              type="text"
              value={contact.formFields.phoneLabel}
              onChange={(e) => updateFormField('phoneLabel', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Telefon Placeholder</label>
            <input
              type="text"
              value={contact.formFields.phonePlaceholder}
              onChange={(e) => updateFormField('phonePlaceholder', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mövzu Label</label>
            <input
              type="text"
              value={contact.formFields.subjectLabel}
              onChange={(e) => updateFormField('subjectLabel', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mesaj Label</label>
            <input
              type="text"
              value={contact.formFields.messageLabel}
              onChange={(e) => updateFormField('messageLabel', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mesaj Placeholder</label>
            <input
              type="text"
              value={contact.formFields.messagePlaceholder}
              onChange={(e) => updateFormField('messagePlaceholder', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Göndər Düyməsi Mətni</label>
            <input
              type="text"
              value={contact.formFields.submitButtonText}
              onChange={(e) => updateFormField('submitButtonText', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mövzu Seçimləri</h3>
          <button onClick={addSubjectOption} className="text-primary-600 font-black text-xs flex items-center gap-1 hover:underline">
            <Plus size={14} /> Seçim əlavə et
          </button>
        </div>
        <div className="space-y-3">
          {contact.subjectOptions.map((option, index) => (
            <div key={`${index}-${option}`} className="flex items-center gap-3">
              <input
                type="text"
                value={option}
                onChange={(e) => updateSubjectOption(index, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
              />
              <button
                onClick={() => removeSubjectOption(index)}
                className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                aria-label="Seçimi sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {contact.subjectOptions.length === 0 && (
            <p className="text-xs font-medium text-slate-400">Seçim yoxdur. Yeni seçim əlavə edin.</p>
          )}
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Share2 size={14} className="text-primary-600" /> Sosial Media və Cavab Bloku
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sosial Başlıq</label>
            <input
              type="text"
              value={contact.socialTitle}
              onChange={(e) => setContact({ ...contact, socialTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cavab Bloku Başlığı</label>
            <input
              type="text"
              value={contact.responseTitle}
              onChange={(e) => setContact({ ...contact, responseTitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Share2 size={14} className="text-slate-900" /> LinkedIn
            </label>
            <input
              type="text"
              value={contact.socialLinks.linkedin}
              onChange={(e) => setContact({ ...contact, socialLinks: { ...contact.socialLinks, linkedin: e.target.value } })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instagram</label>
            <input
              type="text"
              value={contact.socialLinks.instagram}
              onChange={(e) => setContact({ ...contact, socialLinks: { ...contact.socialLinks, instagram: e.target.value } })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facebook</label>
            <input
              type="text"
              value={contact.socialLinks.facebook}
              onChange={(e) => setContact({ ...contact, socialLinks: { ...contact.socialLinks, facebook: e.target.value } })}
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
              onChange={(e) => setContact({ ...contact, responseTime: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cavab Vaxtı Alt Mətni</label>
            <textarea
              rows={2}
              value={contact.responseSuffix}
              onChange={(e) => setContact({ ...contact, responseSuffix: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium outline-none"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactManager;
