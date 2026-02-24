
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save, Plus, Trash2, BookOpen, Star, Layout, Check, 
  Edit3, X, Image as ImageIcon, Upload, Clock, 
  Users, ChevronDown, ChevronUp, Play, ListPlus, 
  Target, Info, ArrowLeft, Search, GraduationCap,
  CheckCircle, Shield, Link2, FileUp, ExternalLink
} from 'lucide-react';
import { Course, CourseModule, CoursePerk, CourseResource, Lesson } from '../../types';
import { useSiteData } from '../../site/SiteDataContext';

const PERK_ICON_OPTIONS: CoursePerk['iconName'][] = ['CheckCircle', 'Shield', 'Users', 'BookOpen', 'Star', 'Clock'];
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'audit_admin_token';

const PERK_ICON_COMPONENTS: Record<CoursePerk['iconName'], React.ComponentType<{ size?: number; className?: string }>> = {
  CheckCircle,
  Shield,
  Users,
  BookOpen,
  Star,
  Clock,
};

const normalizePerks = (perks: Course['perks'] | undefined): CoursePerk[] => {
  const normalized = (perks || []).map((perk) => {
    if (typeof perk === 'string') return { text: perk, iconName: 'CheckCircle' as const };
    return {
      text: String(perk?.text || ''),
      iconName: (perk?.iconName || 'CheckCircle') as CoursePerk['iconName'],
    };
  });
  if (normalized.length > 0) return normalized;
  return [
    { text: 'Ömürlük Giriş', iconName: 'CheckCircle' },
    { text: 'Rəsmi Sertifikat', iconName: 'Shield' },
    { text: 'Mentor Dəstəyi', iconName: 'Users' },
  ];
};

const normalizeResources = (resources: Course['resources'] | undefined): CourseResource[] =>
  (resources || [])
    .map((resource, index) => ({
      id: String(resource?.id || `${Date.now()}-${index}`),
      title: String(resource?.title || ''),
      url: String(resource?.url || ''),
    }));

const EducationManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStandaloneEditor = location.pathname === '/edit-class';
  const { sitemap, saveSection } = useSiteData();
  const [courses, setCourses] = useState<Course[]>(sitemap.education.courses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saved, setSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Page Header Settings (Matching the requested symmetry)
  const [pageHeader, setPageHeader] = useState(sitemap.education.pageHeader);

  useEffect(() => {
    setCourses(sitemap.education.courses);
    setPageHeader(sitemap.education.pageHeader);
  }, [sitemap.education]);

  useEffect(() => {
    if (!isStandaloneEditor) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate('/admin');
    }
  }, [isStandaloneEditor, navigate]);

  useEffect(() => {
    if (!isStandaloneEditor) return;
    const editId = String(searchParams.get('id') || '').trim();
    const editingExisting = editId ? sitemap.education.courses.find((course) => String(course.id) === editId) : null;

    if (editingExisting) {
      setEditingCourse({
        ...editingExisting,
        perks: normalizePerks(editingExisting.perks),
        resources: normalizeResources(editingExisting.resources),
      });
    } else {
      setEditingCourse({
        id: Date.now().toString(),
        title: '',
        instructor: 'İbadət Binyətov',
        price: 0,
        duration: '',
        level: 'Başlanğıc',
        thumbnailUrl: '',
        rating: 5.0,
        description: '',
        longDescription: '',
        learningOutcomes: [],
        requirements: [],
        perks: normalizePerks([]),
        resources: [],
        studentCount: 0,
        modules: [],
      });
    }
    setIsModalOpen(true);
  }, [isStandaloneEditor, searchParams, sitemap.education.courses]);

  const handleSaveAll = async () => {
    const ok = await saveSection('education', { pageHeader, courses });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleCourseSave = async () => {
    if (!editingCourse) return;
    const nextCourses = courses.find(c => c.id === editingCourse.id)
      ? courses.map(c => c.id === editingCourse.id ? editingCourse : c)
      : [...courses, editingCourse];

    const ok = await saveSection('education', { pageHeader, courses: nextCourses });
    if (!ok) return;
    setCourses(nextCourses);
    if (isStandaloneEditor) {
      navigate('/admin/education');
      return;
    }
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  // --- SUB-ITEM EDITORS ---
  const addOutcome = () => {
    if (!editingCourse) return;
    setEditingCourse({ ...editingCourse, learningOutcomes: [...editingCourse.learningOutcomes, 'Yeni nəticə...'] });
  };

  const addModule = () => {
    if (!editingCourse) return;
    const newModule: CourseModule = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Yeni Modul',
      lessons: []
    };
    setEditingCourse({ ...editingCourse, modules: [...editingCourse.modules, newModule] });
  };

  const addLesson = (moduleId: string) => {
    if (!editingCourse) return;
    const newLesson: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Yeni Dərs',
      duration: '00:00',
      videoUrl: ''
    };
    setEditingCourse({
      ...editingCourse,
      modules: editingCourse.modules.map(m => m.id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m)
    });
  };

  const addResource = () => {
    if (!editingCourse) return;
    const next = [...normalizeResources(editingCourse.resources), { id: Math.random().toString(36).slice(2, 11), title: '', url: '' }];
    setEditingCourse({ ...editingCourse, resources: next });
  };

  const handleResourceFileUpload = async (resourceId: string, file: File | null) => {
    if (!editingCourse || !file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const payload = await response.json();
      const uploadedUrl = String(payload?.url || '');
      if (!uploadedUrl) throw new Error('No URL');
      const next = normalizeResources(editingCourse.resources).map((resource) =>
        resource.id === resourceId ? { ...resource, url: uploadedUrl } : resource,
      );
      setEditingCourse({ ...editingCourse, resources: next });
    } catch {
      window.alert('Fayl yüklənərkən xəta baş verdi. Yenidən cəhd edin.');
    }
  };

  if (isStandaloneEditor && !editingCourse) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-black">
        Yüklənir...
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-32">
      {/* 1. Header with Global Save */}
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Akademiya İdarəetməsi</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Kurslar və Kurikulum Sistemi</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => navigate('/edit-class?new=1')} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
              <Plus size={18} /> Yeni Kurs Yarat
           </button>
           <button onClick={handleSaveAll} className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95">
              {saved ? <Check size={18} /> : <Save size={18} />} {saved ? "Saxlanıldı" : "Bütün Kursları Saxla"}
           </button>
        </div>
      </header>

      {/* 2. Public Page Header Editor (The Symmetric Entry Part) */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
            <Layout size={18} className="text-primary-600" /> Səhifə Giriş Başlığı (Symmetry Control)
         </h3>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Giriş Etiketi (Badge)</label>
                  <input type="text" value={pageHeader.badge} onChange={e => setPageHeader({...pageHeader, badge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-bold text-primary-600 text-xs tracking-widest outline-none focus:border-primary-500 transition-all" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Akademiya Başlığı (H1)</label>
                  <input type="text" value={pageHeader.title} onChange={e => setPageHeader({...pageHeader, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-black text-slate-900 text-xl outline-none focus:border-primary-500 transition-all" />
               </div>
            </div>
            <div>
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Akademiya İzahı (Subtext)</label>
               <textarea rows={5} value={pageHeader.sub} onChange={e => setPageHeader({...pageHeader, sub: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-600 font-medium text-sm leading-relaxed outline-none focus:border-primary-500 transition-all" />
            </div>
         </div>
      </section>

      {/* 3. Courses Grid List */}
      <section className="space-y-8">
         <div className="flex justify-between items-center">
            <div className="relative w-full max-w-md">
               <input type="text" placeholder="Kurs axtar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pl-12 font-bold text-slate-900 outline-none focus:border-primary-600 shadow-sm" />
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map(course => (
               <div key={course.id} className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                  <div className="aspect-video relative overflow-hidden bg-slate-100">
                     <img src={course.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                     <div className="absolute top-4 right-4">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg">{course.level}</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className="text-lg font-black text-slate-900 mb-4 line-clamp-2 h-[3rem] group-hover:text-primary-600 transition-colors">{course.title}</h3>
                     <div className="flex items-center justify-between mb-6">
                        <span className="text-2xl font-black text-primary-600">{course.price} ₼</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                           <Users size={14} /> {course.studentCount} Tələbə
                        </div>
                     </div>
                     <div className="flex gap-2 pt-6 border-t border-slate-50">
                        <button onClick={() => navigate(`/edit-class?id=${encodeURIComponent(String(course.id))}`)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-all">
                           <Edit3 size={16} /> Redaktə Et
                        </button>
                        <button onClick={() => setCourses(courses.filter(c => c.id !== course.id))} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* 4. FULL COURSE CONTENT EDITOR */}
      {(isModalOpen || isStandaloneEditor) && editingCourse && (
         <div
           className={
             isStandaloneEditor
               ? 'fixed inset-0 z-[100] bg-slate-50'
               : 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300'
           }
         >
            <div className={isStandaloneEditor ? 'bg-slate-50 w-full min-h-screen overflow-hidden shadow-2xl flex flex-col' : 'bg-slate-50 w-full h-full lg:max-w-[1400px] lg:h-[95vh] lg:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col'}>
               
               {/* Modal Top Bar */}
               <div className="bg-white border-b border-slate-200 p-8 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <button onClick={() => (isStandaloneEditor ? navigate('/admin/education') : setIsModalOpen(false))} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><ArrowLeft size={24} /></button>
                     <div>
                        <h2 className="text-2xl font-black text-slate-900">Kurs Redaktoru</h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Bütün tədris parametrləri buradadır</p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => (isStandaloneEditor ? navigate('/admin/education') : setIsModalOpen(false))} className="px-8 py-3.5 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-all">Ləğv Et</button>
                     <button onClick={handleCourseSave} className="bg-primary-600 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                        <Check size={18} /> Kursu Saxla
                     </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  <div className="max-w-6xl mx-auto space-y-16">
                     
                     {/* A. BASIC INFO & MEDIA */}
                     <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        <div className="lg:col-span-8 space-y-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kurs Başlığı</label>
                              <input type="text" value={editingCourse.title} onChange={e => setEditingCourse({...editingCourse, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-2xl font-black text-slate-900 outline-none focus:border-primary-600 transition-all" placeholder="Kursun adı..." />
                           </div>
                           <div className="grid grid-cols-2 gap-8">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Təlimçi</label>
                                 <input type="text" value={editingCourse.instructor} onChange={e => setEditingCourse({...editingCourse, instructor: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-bold text-slate-900 outline-none" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Qiymət (₼)</label>
                                 <input type="number" value={editingCourse.price} onChange={e => setEditingCourse({...editingCourse, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-black text-primary-600 outline-none" />
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-6">
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Müddət</label>
                                 <input type="text" value={editingCourse.duration} onChange={e => setEditingCourse({...editingCourse, duration: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold" placeholder="32 saat" />
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Səviyyə</label>
                                 <select value={editingCourse.level} onChange={e => setEditingCourse({...editingCourse, level: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none">
                                    <option>Başlanğıc</option>
                                    <option>Orta</option>
                                    <option>İrəli</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reyting</label>
                                 <input type="number" step="0.1" value={editingCourse.rating} onChange={e => setEditingCourse({...editingCourse, rating: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold" />
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><ImageIcon size={14} className="text-primary-600" /> Kurs Thumbnail</label>
                           <div className="aspect-video bg-white rounded-[2.5rem] border border-slate-200 p-4 relative overflow-hidden group">
                              {editingCourse.thumbnailUrl ? (
                                 <img src={editingCourse.thumbnailUrl} className="w-full h-full object-cover rounded-2xl" alt="" />
                              ) : (
                                 <div className="w-full h-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                                    <Upload size={32} className="mb-2" />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Yüklə</span>
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <input type="text" value={editingCourse.thumbnailUrl} onChange={e => setEditingCourse({...editingCourse, thumbnailUrl: e.target.value})} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black outline-none w-4/5" placeholder="Thumbnail URL daxil edin" />
                              </div>
                           </div>
                           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tələbə Sayı (Simulyasiya)</label>
                              <input type="number" value={editingCourse.studentCount} onChange={e => setEditingCourse({...editingCourse, studentCount: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-slate-900" />
                           </div>
                        </div>
                     </section>

                     {/* B. DETAILED DESCRIPTION */}
                     <section className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Qısa Təsvir (Kartda görünən)</label>
                           <textarea rows={3} value={editingCourse.description} onChange={e => setEditingCourse({...editingCourse, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-8 py-6 text-slate-600 font-medium leading-relaxed outline-none focus:border-primary-600 transition-all" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Uzun Təsvir (Daxili səhifədə)</label>
                           <textarea rows={8} value={editingCourse.longDescription} onChange={e => setEditingCourse({...editingCourse, longDescription: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-slate-600 font-medium leading-relaxed outline-none focus:border-primary-600 transition-all" />
                        </div>
                     </section>

                     {/* C. OUTCOMES & REQUIREMENTS */}
                     <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target size={14} className="text-emerald-500" /> Nə Öyrənəcəksiniz?</h4>
                              <button onClick={addOutcome} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Plus size={16} /></button>
                           </div>
                           <div className="space-y-4">
                              {editingCourse.learningOutcomes.map((outcome, idx) => (
                                 <div key={idx} className="flex gap-3 group bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                    <input 
                                       type="text" 
                                       value={outcome} 
                                       onChange={e => {
                                          const newOutcomes = [...editingCourse.learningOutcomes];
                                          newOutcomes[idx] = e.target.value;
                                          setEditingCourse({...editingCourse, learningOutcomes: newOutcomes});
                                       }}
                                       className="flex-1 bg-transparent border-none text-xs font-bold text-slate-700 outline-none" 
                                    />
                                    <button onClick={() => setEditingCourse({...editingCourse, learningOutcomes: editingCourse.learningOutcomes.filter((_, i) => i !== idx)})} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                           <div className="flex justify-between items-center mb-8">
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Info size={14} className="text-amber-500" /> Tələblər</h4>
                              <button onClick={() => setEditingCourse({...editingCourse, requirements: [...editingCourse.requirements, 'Yeni tələb...']})} className="p-2 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all"><Plus size={16} /></button>
                           </div>
                           <div className="space-y-4">
                              {editingCourse.requirements.map((req, idx) => (
                                 <div key={idx} className="flex gap-3 group bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                                    <input 
                                       type="text" 
                                       value={req} 
                                       onChange={e => {
                                          const newReqs = [...editingCourse.requirements];
                                          newReqs[idx] = e.target.value;
                                          setEditingCourse({...editingCourse, requirements: newReqs});
                                       }}
                                       className="flex-1 bg-transparent border-none text-xs font-bold text-slate-700 outline-none" 
                                    />
                                    <button onClick={() => setEditingCourse({...editingCourse, requirements: editingCourse.requirements.filter((_, i) => i !== idx)})} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </section>

                     {/* C.2 PERKS (COURSE BENEFITS) */}
                     <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Star size={14} className="text-primary-600" /> Kurs Üstünlükləri (İkon + Mətn)
                           </h4>
                           <button
                             onClick={() =>
                               setEditingCourse({
                                 ...editingCourse,
                                 perks: [...normalizePerks(editingCourse.perks), { text: 'Yeni üstünlük', iconName: 'CheckCircle' }],
                               })
                             }
                             className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-600 hover:text-white transition-all"
                           >
                             <Plus size={16} />
                           </button>
                        </div>
                        <div className="space-y-4">
                           {normalizePerks(editingCourse.perks).map((perk, idx) => (
                             <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-100">
                               <div className="md:col-span-3 flex items-center gap-2">
                                 <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-primary-600 shrink-0">
                                   {(() => {
                                     const IconPreview = PERK_ICON_COMPONENTS[perk.iconName];
                                     return <IconPreview size={16} />;
                                   })()}
                                 </div>
                                 <select
                                   value={perk.iconName}
                                   onChange={(e) => {
                                     const next = normalizePerks(editingCourse.perks);
                                     next[idx] = { ...next[idx], iconName: e.target.value as CoursePerk['iconName'] };
                                     setEditingCourse({ ...editingCourse, perks: next });
                                   }}
                                   className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                                 >
                                   {PERK_ICON_OPTIONS.map((icon) => (
                                     <option key={icon} value={icon}>{icon}</option>
                                   ))}
                                 </select>
                               </div>
                               <div className="md:col-span-8">
                                 <input
                                   type="text"
                                   value={perk.text}
                                   onChange={(e) => {
                                     const next = normalizePerks(editingCourse.perks);
                                     next[idx] = { ...next[idx], text: e.target.value };
                                     setEditingCourse({ ...editingCourse, perks: next });
                                   }}
                                   className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                                   placeholder="Üstünlük mətni..."
                                 />
                               </div>
                               <div className="md:col-span-1 flex justify-end">
                                 <button
                                   onClick={() => {
                                     const next = normalizePerks(editingCourse.perks).filter((_, i) => i !== idx);
                                     setEditingCourse({ ...editingCourse, perks: next.length ? next : normalizePerks([]) });
                                   }}
                                   className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                 >
                                   <Trash2 size={14} />
                                 </button>
                               </div>
                             </div>
                           ))}
                        </div>
                     </section>

                     {/* C.3 COURSE RESOURCES */}
                     <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <BookOpen size={14} className="text-amber-600" /> Kurs Resursları
                           </h4>
                           <button
                             onClick={addResource}
                             className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all"
                           >
                             <Plus size={16} />
                           </button>
                        </div>

                        <div className="space-y-4">
                           {normalizeResources(editingCourse.resources).length === 0 ? (
                             <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-xs font-bold text-slate-400">
                               Hələ resurs əlavə edilməyib.
                             </div>
                           ) : (
                             normalizeResources(editingCourse.resources).map((resource, idx) => (
                             <div key={resource.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-slate-100">
                                 <div className="md:col-span-4">
                                   <input
                                     type="text"
                                     value={resource.title}
                                     onChange={(e) => {
                                       const next = normalizeResources(editingCourse.resources);
                                       next[idx] = { ...next[idx], title: e.target.value };
                                       setEditingCourse({ ...editingCourse, resources: next });
                                     }}
                                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none"
                                     placeholder="Resurs adı (məs: PDF, Check-list)..."
                                   />
                                 </div>
                                 <div className="md:col-span-6">
                                   <input
                                     type="url"
                                     value={resource.url}
                                     onChange={(e) => {
                                       const next = normalizeResources(editingCourse.resources);
                                       next[idx] = { ...next[idx], url: e.target.value };
                                       setEditingCourse({ ...editingCourse, resources: next });
                                     }}
                                     className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 outline-none"
                                     placeholder="https://... və ya /uploads/..."
                                   />
                                 </div>
                                 <div className="md:col-span-2 flex justify-end gap-2">
                                   <input
                                     ref={(el) => {
                                       resourceInputRefs.current[resource.id] = el;
                                     }}
                                     type="file"
                                     accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                                     className="hidden"
                                     onChange={(e) => {
                                       void handleResourceFileUpload(resource.id, e.target.files?.[0] || null);
                                       e.currentTarget.value = '';
                                     }}
                                   />
                                   <button
                                     onClick={() => resourceInputRefs.current[resource.id]?.click()}
                                     className="inline-flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all"
                                     title="Fayl Yüklə"
                                   >
                                     <FileUp size={12} /> Yüklə
                                   </button>
                                   {resource.url ? (
                                     <a
                                       href={resource.url}
                                       target="_blank"
                                       rel="noreferrer"
                                       className="inline-flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                                       title="Aç"
                                     >
                                       <ExternalLink size={12} /> Aç
                                     </a>
                                   ) : (
                                     <span className="inline-flex items-center gap-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-100 text-slate-400">
                                       <Link2 size={12} /> Link
                                     </span>
                                   )}
                                   <button
                                     onClick={() => {
                                       const next = normalizeResources(editingCourse.resources).filter((_, i) => i !== idx);
                                       setEditingCourse({ ...editingCourse, resources: next });
                                     }}
                                     className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                   >
                                     <Trash2 size={14} />
                                   </button>
                                 </div>
                               </div>
                             ))
                           )}
                        </div>
                     </section>

                     {/* D. CURRICULUMMeneceri (MODULLAR VƏ DƏRSLƏR) */}
                     <section className="bg-slate-900 p-12 rounded-[4rem] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5"><GraduationCap size={160} /></div>
                        <div className="flex justify-between items-center mb-12 relative z-10">
                           <div>
                              <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Dərslər Siyahısı</h4>
                              <h3 className="text-3xl font-black">Kursun Kurikulumu</h3>
                           </div>
                           <button onClick={addModule} className="px-8 py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all flex items-center gap-2">
                              <ListPlus size={18} /> Yeni Modul Əlavə Et
                           </button>
                        </div>

                        <div className="space-y-8 relative z-10">
                           {editingCourse.modules.map((module, mIdx) => (
                              <div key={module.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8">
                                 <div className="flex justify-between items-center">
                                    <div className="flex-1 max-w-lg">
                                       <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Modul Başlığı</label>
                                       <input 
                                          type="text" 
                                          value={module.title} 
                                          onChange={e => {
                                             const newModules = [...editingCourse.modules];
                                             newModules[mIdx].title = e.target.value;
                                             setEditingCourse({...editingCourse, modules: newModules});
                                          }}
                                          className="w-full bg-white/5 border-none rounded-xl px-4 py-2 font-black text-xl text-white outline-none" 
                                       />
                                    </div>
                                    <div className="flex gap-3">
                                       <button onClick={() => addLesson(module.id)} className="px-6 py-2.5 bg-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-900/50">
                                          <Plus size={14} /> Dərs Əlavə Et
                                       </button>
                                       <button onClick={() => setEditingCourse({...editingCourse, modules: editingCourse.modules.filter(m => m.id !== module.id)})} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 gap-4">
                                    {module.lessons.map((lesson, lIdx) => (
                                       <div key={lesson.id} className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                             <div className="lg:col-span-5">
                                                <div className="flex items-center gap-4">
                                                   <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary-400 font-black">{lIdx + 1}</div>
                                                   <input 
                                                      type="text" 
                                                      value={lesson.title} 
                                                      onChange={e => {
                                                         const newModules = [...editingCourse.modules];
                                                         newModules[mIdx].lessons[lIdx].title = e.target.value;
                                                         setEditingCourse({...editingCourse, modules: newModules});
                                                      }}
                                                      className="flex-1 bg-transparent border-none text-white font-black text-sm outline-none" 
                                                      placeholder="Dərsin adı..."
                                                   />
                                                </div>
                                             </div>
                                             <div className="lg:col-span-2">
                                                <input 
                                                   type="text" 
                                                   value={lesson.duration} 
                                                   onChange={e => {
                                                      const newModules = [...editingCourse.modules];
                                                      newModules[mIdx].lessons[lIdx].duration = e.target.value;
                                                      setEditingCourse({...editingCourse, modules: newModules});
                                                   }}
                                                   className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-center text-slate-400" 
                                                   placeholder="00:00"
                                                />
                                             </div>
                                             <div className="lg:col-span-4">
                                                <input 
                                                   type="text" 
                                                   value={lesson.videoUrl} 
                                                   onChange={e => {
                                                      const newModules = [...editingCourse.modules];
                                                      newModules[mIdx].lessons[lIdx].videoUrl = e.target.value;
                                                      setEditingCourse({...editingCourse, modules: newModules});
                                                   }}
                                                   className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-medium text-slate-500" 
                                                   placeholder="Video Link (MP4/Youtube)..."
                                                />
                                             </div>
                                             <div className="lg:col-span-1 flex justify-end">
                                                <button onClick={() => {
                                                   const newModules = [...editingCourse.modules];
                                                   newModules[mIdx].lessons = newModules[mIdx].lessons.filter(l => l.id !== lesson.id);
                                                   setEditingCourse({...editingCourse, modules: newModules});
                                                }} className="p-2 text-white/20 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                  </div>
               </div>

               {/* Modal Footer Info */}
               <div className="bg-white border-t border-slate-100 p-6 px-12 flex justify-between items-center">
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                     <BookOpen size={16} className="text-primary-600" /> Tədris Redaktoru v4.0
                  </div>
                  <div className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">audit.tv Education Management System</div>
               </div>

            </div>
         </div>
      )}
    </div>
  );
};

export default EducationManager;
