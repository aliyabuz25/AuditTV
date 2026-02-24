
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, ChevronLeft, MessageSquare, Download, Trophy, List } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';

const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sitemap } = useSiteData();
  const COURSES = sitemap.education.courses;
  const course = COURSES.find(c => c.id === id);
  
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const allLessons = useMemo(() => course?.modules.flatMap((m) => m.lessons) || [], [course]);
  const lessonIds = useMemo(() => new Set(allLessons.map((lesson) => lesson.id)), [allLessons]);
  const totalLessons = allLessons.length;

  const progressStorageKey =
    userEmail && id ? `audit_course_progress_${userEmail}_${id}` : '';
  const lastLessonStorageKey =
    userEmail && id ? `audit_course_last_lesson_${userEmail}_${id}` : '';

  const activeLesson =
    allLessons.find((lesson) => lesson.id === activeLessonId) ||
    allLessons[0] ||
    null;

  useEffect(() => {
    let cancelled = false;
    const currentUserEmail = localStorage.getItem('audit_current_user_email') || '';

    if (!currentUserEmail) {
      setIsAuthorized(false);
      navigate(`/tedris/${id}`);
      return;
    }
    setUserEmail(currentUserEmail);

    if (currentUserEmail === 'tural.rahim99@gmail.com') {
      setIsAuthorized(true);
      return;
    }

    const run = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/api/course-requests/check?email=${encodeURIComponent(currentUserEmail)}&courseId=${encodeURIComponent(id || '')}`,
        );
        const payload = response.ok ? await response.json() : { request: null };
        const request = payload.request;
        if (!cancelled && request && request.status === 'approved') {
          setIsAuthorized(true);
          return;
        }
      } catch {
        // Redirect to detail on access check failure
      }

      if (!cancelled) {
        setIsAuthorized(false);
        navigate(`/tedris/${id}`);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, id, navigate]);

  useEffect(() => {
    if (!isAuthorized || !progressStorageKey) return;
    try {
      const raw = localStorage.getItem(progressStorageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const filtered = parsed.filter((lessonId) => lessonIds.has(lessonId));
      setCompletedLessons(filtered);
    } catch {
      setCompletedLessons([]);
    }
  }, [isAuthorized, progressStorageKey, lessonIds]);

  useEffect(() => {
    if (!isAuthorized || !lastLessonStorageKey) return;
    const savedLessonId = localStorage.getItem(lastLessonStorageKey) || '';
    if (savedLessonId && lessonIds.has(savedLessonId)) {
      setActiveLessonId(savedLessonId);
      return;
    }
    setActiveLessonId(allLessons[0]?.id || '');
  }, [isAuthorized, lastLessonStorageKey, lessonIds, allLessons]);

  useEffect(() => {
    if (!isAuthorized || !progressStorageKey) return;
    localStorage.setItem(progressStorageKey, JSON.stringify(completedLessons));
  }, [isAuthorized, progressStorageKey, completedLessons]);

  useEffect(() => {
    if (!isAuthorized || !lastLessonStorageKey || !activeLesson?.id) return;
    localStorage.setItem(lastLessonStorageKey, activeLesson.id);
  }, [isAuthorized, lastLessonStorageKey, activeLesson]);

  if (isAuthorized === null) return <div className="bg-slate-900 h-screen flex items-center justify-center text-white font-black">Yoxlanılır...</div>;
  if (!isAuthorized) return null;
  if (!course) return <div>Kurs tapılmadı.</div>;

  const toggleComplete = (lessonId: string) => {
    if (!lessonId) return;
    setCompletedLessons(prev => 
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  return (
    <div className="bg-slate-900 min-h-screen pt-20 flex flex-col lg:flex-row overflow-hidden h-screen">
      
      {/* Video Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
         <div className="bg-black aspect-video w-full relative">
            {activeLesson?.videoUrl ? (
              <video
                key={activeLesson.id}
                className="w-full h-full"
                controls
                autoPlay
                src={activeLesson.videoUrl}
                onEnded={() => toggleComplete(activeLesson.id)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                Bu dərs üçün video tapılmadı.
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-3">
               <Link to={`/tedris/${course.id}`} className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all">
                  <ChevronLeft size={20} />
               </Link>
               <span className="text-white text-sm font-black bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md">{activeLesson?.title}</span>
            </div>
         </div>

         <div className="p-8 bg-slate-900 flex-1">
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h1 className="text-3xl font-black text-white mb-4">{activeLesson?.title}</h1>
                  <div className="flex items-center gap-4 text-slate-400 text-sm font-bold">
                     <span className="bg-white/10 px-3 py-1 rounded-lg">Dərs Müddəti: {activeLesson?.duration}</span>
                  </div>
               </div>
               <button 
                 onClick={() => toggleComplete(activeLesson?.id || '')}
                 className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                   activeLesson?.id && completedLessons.includes(activeLesson.id) 
                   ? 'bg-emerald-600 text-white' 
                   : 'bg-white/10 text-white hover:bg-white/20'
                 }`}
                 disabled={!activeLesson}
               >
                  <CheckCircle size={18} /> {activeLesson?.id && completedLessons.includes(activeLesson.id) ? 'Tamamlandı' : 'Tamamlandı kimi qeyd et'}
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
               <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                  <MessageSquare className="text-primary-400" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Sual-Cavab</span>
               </button>
               <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                  <Download className="text-amber-400" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Resurslar</span>
               </button>
               <button className="flex flex-col items-center gap-3 p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5">
                  <Trophy className="text-emerald-400" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Sertifikat</span>
               </button>
            </div>
         </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full lg:w-96 bg-slate-800 border-l border-white/10 flex flex-col h-full overflow-hidden">
         <div className="p-6 border-b border-white/10 bg-slate-900/50">
            <h3 className="text-white font-black flex items-center gap-2 mb-2 uppercase tracking-widest text-sm">
               <List size={18} className="text-primary-500" /> Kursun Məzmunu
            </h3>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-6">
               <div 
                 className="bg-primary-600 h-full transition-all duration-500" 
                 style={{ width: `${progressPercent}%` }}
               />
            </div>
            <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest text-right">
               Progress: {progressPercent}%
            </p>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {totalLessons === 0 ? (
               <div className="p-6 rounded-2xl bg-white/5 text-slate-300 text-sm font-medium">
                  Bu kurs üçün hələ dərs əlavə edilməyib.
               </div>
            ) : course.modules.map((module) => (
               <div key={module.id}>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{module.title}</h4>
                  <div className="space-y-1">
                     {module.lessons.map((lesson) => (
                        <button 
                           key={lesson.id}
                           onClick={() => setActiveLessonId(lesson.id)}
                           className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left ${
                             activeLesson?.id === lesson.id 
                             ? 'bg-primary-600 text-white' 
                             : 'hover:bg-white/5 text-slate-300'
                           }`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`p-1 rounded ${activeLesson?.id === lesson.id ? 'bg-white/20' : 'bg-white/5'}`}>
                                 {completedLessons.includes(lesson.id) ? <CheckCircle size={14} className="text-emerald-400" /> : <Play size={14} />}
                              </div>
                              <span className="text-xs font-bold leading-tight">{lesson.title}</span>
                           </div>
                           <span className="text-[10px] font-medium opacity-60 ml-4 flex-shrink-0">{lesson.duration}</span>
                        </button>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default CoursePlayer;
