
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Clock, Users, CheckCircle, ChevronDown, ChevronUp, Play, Lock, X, Mail, Shield, AlertCircle, Clock3, UserPlus, LogIn, Key, BookOpen } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import { useToast } from '../components/ToastProvider';
import { CoursePerk } from '../types';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sitemap } = useSiteData();
  const toast = useToast();
  const COURSES = sitemap.education.courses;
  const course = COURSES.find(c => c.id === id);
  const normalizedPerks: CoursePerk[] = (course?.perks || []).map((perk) => {
    if (typeof perk === 'string') {
      return { text: perk, iconName: 'CheckCircle' };
    }
    return {
      text: perk?.text || '',
      iconName: perk?.iconName || 'CheckCircle',
    };
  }).filter((perk) => perk.text);

  const perkIcons = {
    CheckCircle,
    Shield,
    Users,
    BookOpen,
    Star,
    Clock,
  } as const;
  
  const [openModule, setOpenModule] = useState<string | null>(course?.modules[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [status, setStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [error, setError] = useState('');
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

  useEffect(() => {
    const userEmail = localStorage.getItem('audit_current_user_email');
    if (userEmail) {
      setEmail(userEmail);
      void checkAccessStatus(userEmail);
    }
  }, [id]);

  useEffect(() => {
    const authMode = String(searchParams.get('auth') || '').toLowerCase();
    if (authMode === 'login' || authMode === 'register') {
      setActiveTab(authMode === 'register' ? 'register' : 'login');
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const checkAccessStatus = async (userEmail: string) => {
    const response = await fetch(`${API_BASE}/api/course-requests/check?email=${encodeURIComponent(userEmail)}&courseId=${encodeURIComponent(id || '')}`);
    const payload = response.ok ? await response.json() : { request: null };
    const userRequest = payload.request;
    if (userRequest) {
      setStatus(userRequest.status);
    } else {
      setStatus('none');
    }
  };

  if (!course) return <div className="pt-32 text-center text-slate-900 font-bold">Kurs tapılmadı.</div>;

  const handleStartClick = () => {
    if (status === 'approved') {
      navigate(`/tedris/${course.id}/player`);
    } else {
      setError('');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (searchParams.has('auth')) {
      const next = new URLSearchParams(searchParams);
      next.delete('auth');
      setSearchParams(next, { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch(`${API_BASE}/api/course-requests/check?email=${encodeURIComponent(email)}&courseId=${encodeURIComponent(id || '')}`);
    const payload = response.ok ? await response.json() : { request: null };
    const userRequest = payload.request;

    if (userRequest) {
      // Check password first
      if (userRequest.password !== password) {
        const message = 'Email və ya şifrə yanlışdır.';
        setError(message);
        toast.error(message);
        return;
      }

      if (userRequest.status === 'approved') {
        localStorage.setItem('audit_current_user_email', email);
        setStatus('approved');
        setIsModalOpen(false);
        toast.success('Giriş uğurla tamamlandı.');
        navigate(`/tedris/${course.id}/player`);
      } else {
        const message = 'Sizin qeydiyyatınız mövcud deyil';
        setError(message);
        toast.error(message);
      }
    } else {
      const message = 'Sizin qeydiyyatınız mövcud deyil';
      setError(message);
      toast.error(message);
    }
  };

  const handleRegisterRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) return;

    const checkResponse = await fetch(`${API_BASE}/api/course-requests/check?email=${encodeURIComponent(email)}&courseId=${encodeURIComponent(id || '')}`);
    const checkPayload = checkResponse.ok ? await checkResponse.json() : { request: null };
    const exists = checkPayload.request;

    if (!exists) {
      const newRequest = {
        email,
        fullName,
        password, 
        courseId: id,
        status: 'pending',
        timestamp: new Date().toLocaleString('az-AZ')
      };
      const submitResponse = await fetch(`${API_BASE}/api/course-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      if (!submitResponse.ok) {
        const payload = await submitResponse.json().catch(() => ({}));
        const message = String(payload.error || 'Müraciət göndərilərkən xəta baş verdi.');
        setError(message);
        toast.error(message);
        return;
      }
      localStorage.setItem('audit_current_user_email', email);
      setStatus('pending');
      setIsModalOpen(false);
      toast.success('Müraciətiniz qəbul olundu. Admin təsdiqindən sonra daxil ola bilərsiniz.');
    } else {
      if (exists.status === 'approved') {
        localStorage.setItem('audit_current_user_email', email);
        setStatus('approved');
        toast.success('Giriş təsdiqlənib, yönləndirilirsiniz.');
        navigate(`/tedris/${course.id}/player`);
      } else if (exists.status === 'rejected') {
        const retryResponse = await fetch(`${API_BASE}/api/course-requests`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, courseId: id, status: 'pending' }),
        });

        if (!retryResponse.ok) {
          const message = 'Müraciət yenilənərkən xəta baş verdi.';
          setError(message);
          toast.error(message);
          return;
        }

        setStatus('pending');
        setIsModalOpen(false);
        toast.success('Müraciətiniz yenidən göndərildi. Admin təsdiqindən sonra giriş açılacaq.');
      } else {
        setStatus('pending');
        const message = 'Sizin artıq bu kurs üçün müraciətiniz var və gözləmədədir.';
        setError(message);
        toast.error(message);
      }
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-20">
      
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
           <img src={course.thumbnailUrl} className="w-full h-full object-cover blur-sm" alt="" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-8">
                 <div className="flex gap-2 mb-6">
                    <span className="px-3 py-1 bg-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.level}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">{course.duration}</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{course.title}</h1>
                 <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">{course.description}</p>
                 
                 <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-bold">
                    <div className="flex items-center gap-1 text-amber-400">
                       <Star size={18} fill="currentColor" /> {course.rating} Reyting
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                       <Users size={18} /> {course.studentCount.toLocaleString()} Tələbə
                    </div>
                    <div className="text-slate-400">Təlimçi: <span className="text-white underline">{course.instructor}</span></div>
                 </div>
                 
                 <div className="flex flex-wrap gap-4 items-center">
                    {status === 'approved' ? (
                      <button 
                        onClick={handleStartClick}
                        className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl flex items-center gap-3 text-lg"
                      >
                         Dərslərə Başla <Play size={20} fill="currentColor" />
                      </button>
                    ) : status === 'pending' ? (
                      <div className="flex flex-col gap-2">
                        <div className="px-10 py-5 bg-amber-500/10 border border-amber-500/30 text-amber-500 font-black rounded-2xl flex items-center gap-3">
                           <Clock3 size={24} /> Giriş Sorğusu Göndərilib (Gözləyir)
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="text-xs text-slate-400 underline font-bold hover:text-white transition-colors text-left px-4">Hesabına daxil ol</button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleStartClick}
                        className="px-10 py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-2xl shadow-primary-900 flex items-center gap-3 text-lg"
                      >
                         Kursa başla <ChevronDown size={20} />
                      </button>
                    )}
                    <div className="px-10 py-5 text-3xl font-black">{course.price} ₼</div>
                 </div>
                 {status === 'pending' && (
                    <p className="mt-4 text-slate-400 text-sm font-medium italic">
                      Bu kurs üçün ödəniş təsdiqləndikdən sonra videolar aktivləşəcək. Hər kurs ayrıca alınır.
                    </p>
                 )}
              </div>

              <div className="lg:col-span-4 hidden lg:block">
                 <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl border border-white/10">
                    <div className="aspect-video rounded-[2rem] overflow-hidden mb-6 relative group">
                       <img src={course.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play size={48} className="text-white opacity-80" />
                       </div>
                    </div>
                    <div className="p-4 space-y-4">
                       {normalizedPerks.length > 0 ? (
                         normalizedPerks.map((perk, index) => {
                           const Icon = perkIcons[perk.iconName] || CheckCircle;
                           return (
                             <div key={`${perk.text}-${index}`} className="flex items-center gap-3 text-slate-900 font-bold">
                               <Icon className="text-primary-600" size={20} /> {perk.text}
                             </div>
                           );
                         })
                       ) : (
                         <div className="flex items-center gap-3 text-slate-900 font-bold">
                            <CheckCircle className="text-primary-600" size={20} /> Ömürlük Giriş
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Unified Login / Registration Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in fade-in duration-300">
               
               {/* Modal Header with Tabs */}
               <div className="bg-slate-50 border-b border-slate-100 px-2 pt-2">
                  <div className="flex justify-end pr-2 pt-2">
                    <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-900">
                       <X size={20} />
                    </button>
                  </div>
                  <div className="flex px-4 mt-2">
                     <button 
                        onClick={() => { setActiveTab('login'); setError(''); setPassword(''); }}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'login' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        <div className="flex items-center justify-center gap-2">
                          <LogIn size={14} /> Daxil ol
                        </div>
                        {activeTab === 'login' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 rounded-t-full"></div>}
                     </button>
                     <button 
                        onClick={() => { setActiveTab('register'); setError(''); setPassword(''); }}
                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'register' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        <div className="flex items-center justify-center gap-2">
                          <UserPlus size={14} /> Qeydiyyatdan keç
                        </div>
                        {activeTab === 'register' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-600 rounded-t-full"></div>}
                     </button>
                  </div>
               </div>

               <div className="p-10">
                  {error && (
                    <div className="mb-6 p-5 bg-[#0c0a0a] border border-red-900/40 text-red-500 text-xs font-medium rounded-2xl animate-in fade-in duration-300 leading-relaxed shadow-lg">
                      {error}
                    </div>
                  )}

                  {activeTab === 'login' ? (
                    /* LOGIN FORM */
                    <form onSubmit={handleLogin} className="space-y-6">
                       <h3 className="text-2xl font-black text-slate-900 mb-2">Tələbə Girişi</h3>
                       <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">Yalnız bu kurs üçün girişi təsdiqlənmiş tələbələr daxil ola bilər.</p>
                       
                       <div className="space-y-4">
                          <div className="relative">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">E-poçt</label>
                             <input 
                                required
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 font-bold pl-12" 
                                placeholder="nümunə@mail.com" 
                             />
                             <Mail className="absolute left-4 top-[2.4rem] text-slate-300" size={18} />
                          </div>
                          <div className="relative">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Şifrə</label>
                             <input 
                                required
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 font-bold pl-12" 
                                placeholder="••••••" 
                             />
                             <Key className="absolute left-4 top-[2.4rem] text-slate-300" size={18} />
                          </div>
                       </div>

                       <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2">
                          Giriş Et <LogIn size={18} />
                       </button>
                    </form>
                  ) : (
                    /* REGISTER / REQUEST FORM */
                    <form onSubmit={handleRegisterRequest} className="space-y-6">
                       <h3 className="text-2xl font-black text-slate-900 mb-2">Kurs Üçün Müraciət</h3>
                       <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">Hesab yaradın və yalnız bu kurs üçün giriş müraciəti göndərin.</p>
                       
                       <div className="space-y-4">
                          <div className="relative">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ad və Soyad</label>
                             <input 
                                required
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 font-bold pl-12" 
                                placeholder="Məsələn: Tural Rəhimli" 
                             />
                             <Users className="absolute left-4 top-[2.4rem] text-slate-300" size={18} />
                          </div>
                          <div className="relative">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">E-poçt Ünvanı</label>
                             <input 
                                required
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 font-bold pl-12" 
                                placeholder="nümunə@mail.com" 
                             />
                             <Mail className="absolute left-4 top-[2.4rem] text-slate-300" size={18} />
                          </div>
                          <div className="relative">
                             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Şifrə təyin edin</label>
                             <input 
                                required
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 focus:outline-none focus:border-primary-600 font-bold pl-12" 
                                placeholder="••••••" 
                             />
                             <Key className="absolute left-4 top-[2.4rem] text-slate-300" size={18} />
                          </div>
                       </div>

                       <button type="submit" className="w-full py-5 bg-primary-600 text-white font-black rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2">
                          Müraciət et <Play size={18} fill="currentColor" />
                       </button>
                       
                       <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex gap-3">
                         <Shield className="text-primary-600 flex-shrink-0" size={16} />
                         <p className="text-[10px] text-primary-700 font-bold leading-relaxed uppercase">
                           Ödəniş təsdiqləndikdən sonra yalnız bu kurs hesabınıza əlavə olunacaq.
                         </p>
                       </div>
                    </form>
                  )}
               </div>
            </div>
         </div>
      )}

      {/* Course Content Sections */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
               <div className="bg-white rounded-[2.5rem] p-10 edu-card-shadow border border-slate-100 mb-12">
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Bu kursda nə öyrənəcəksiniz?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {course.learningOutcomes.map((outcome, i) => (
                        <div key={i} className="flex gap-3">
                           <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
                           <span className="text-slate-600 font-medium leading-relaxed">{outcome}</span>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-8">Kursun Məzmunu</h2>
                  <div className="space-y-4">
                     {course.modules.map(module => (
                        <div key={module.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                           <button 
                             onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                             className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                           >
                              <div className="flex items-center gap-4">
                                 {openModule === module.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                 <span className="font-black text-slate-900">{module.title}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-400">{module.lessons.length} Dərs</span>
                           </button>
                           {openModule === module.id && (
                              <div className="p-2 space-y-1">
                                 {module.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 group">
                                       <div className="flex items-center gap-3">
                                          {(lesson.isPreview || status === 'approved') ? <Play size={16} className="text-primary-600" /> : <Lock size={16} className="text-slate-300" />}
                                          <span className={`text-sm font-bold ${(lesson.isPreview || status === 'approved') ? 'text-slate-900' : 'text-slate-400'}`}>{lesson.title}</span>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          {lesson.isPreview && <span className="text-[10px] font-black text-primary-600 uppercase">Ön Baxış</span>}
                                          <span className="text-xs font-medium text-slate-400">{lesson.duration}</span>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            <div className="lg:col-span-4">
               <div className="bg-white rounded-[2.5rem] p-10 edu-card-shadow border border-slate-100 sticky top-24">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Tələblər</h3>
                  <ul className="space-y-4">
                     {course.requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                           <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                           {req}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default CourseDetail;
