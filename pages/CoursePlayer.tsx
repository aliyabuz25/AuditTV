
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, ChevronLeft, MessageSquare, Download, Trophy, List, ExternalLink } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import CsPlayerEmbed from '../components/CsPlayerEmbed';

const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sitemap } = useSiteData();
  const COURSES = sitemap.education.courses;
  const course = COURSES.find(c => c.id === id);
  
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [note, setNote] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const allLessons = useMemo(() => course?.modules.flatMap((m) => m.lessons) || [], [course]);
  const lessonIds = useMemo(() => new Set(allLessons.map((lesson) => lesson.id)), [allLessons]);
  const totalLessons = allLessons.length;
  const courseResources = useMemo(
    () =>
      (course?.resources || [])
        .map((resource, index) => ({
          id: String(resource?.id || index + 1),
          title: String(resource?.title || `Resurs ${index + 1}`),
          url: String(resource?.url || '').trim(),
        }))
        .filter((resource) => resource.url),
    [course?.resources],
  );

  const progressStorageKey =
    userEmail && id ? `audit_course_progress_${userEmail}_${id}` : '';
  const qaStorageKey =
    userEmail && id ? `audit_course_qa_${userEmail}_${id}` : '';
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
    if (!isAuthorized || !qaStorageKey) return;
    try {
      const raw = localStorage.getItem(qaStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Array<{ id: string; text: string; createdAt: string }>) : [];
      setQuestions(Array.isArray(parsed) ? parsed : []);
    } catch {
      setQuestions([]);
    }
  }, [isAuthorized, qaStorageKey]);

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
    if (!isAuthorized || !qaStorageKey) return;
    localStorage.setItem(qaStorageKey, JSON.stringify(questions));
  }, [isAuthorized, qaStorageKey, questions]);

  useEffect(() => {
    if (!isAuthorized || !lastLessonStorageKey || !activeLesson?.id) return;
    localStorage.setItem(lastLessonStorageKey, activeLesson.id);
  }, [isAuthorized, lastLessonStorageKey, activeLesson]);

  if (isAuthorized === null) return <div className="bg-slate-50 h-screen flex items-center justify-center text-slate-700 font-black">Yoxlanılır...</div>;
  if (!isAuthorized) return null;
  if (!course) return <div className="bg-slate-50 min-h-screen flex items-center justify-center text-slate-700 font-bold">Kurs tapılmadı.</div>;

  const toggleComplete = (lessonId: string) => {
    if (!lessonId) return;
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  const canDownloadCertificate = totalLessons > 0 && completedLessons.length >= totalLessons;

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = question.trim();
    if (!text) return;
    setQuestions((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text,
        createdAt: new Date().toLocaleString('az-AZ'),
      },
      ...prev,
    ]);
    setQuestion('');
    setNote('Sualınız qeyd edildi.');
  };

  const handleCertificateDownload = () => {
    if (!canDownloadCertificate) {
      setNote('Sertifikat üçün əvvəlcə bütün dərsləri tamamlayın.');
      return;
    }
    const certificate = [
      'AUDIT.TV SERTIFIKAT',
      '',
      `Istifadeci: ${userEmail}`,
      `Kurs: ${course.title}`,
      `Tamamlanma: ${new Date().toLocaleString('az-AZ')}`,
      `Ders sayi: ${totalLessons}/${totalLessons}`,
    ].join('\n');
    const blob = new Blob([certificate], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sertifikat-${course.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setNote('Sertifikat yükləndi.');
  };

  return (
    <div className="bg-slate-50 min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row">
      {/* Video Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <div className="bg-slate-950 w-full relative overflow-hidden shrink-0 h-[230px] sm:h-[320px] md:h-[420px] lg:h-[min(56vh,620px)]">
          <CsPlayerEmbed
            videoUrl={activeLesson?.videoUrl}
            autoplay={true}
            forceNative={true}
            onEnded={() => {
              if (activeLesson?.id) toggleComplete(activeLesson.id);
            }}
            className="w-full h-full object-contain bg-black [&_.csPlayer]:w-full [&_.csPlayer]:h-full [&_.csPlayer]:rounded-none [&_.csPlayer]:min-w-0"
            emptyMessage="Bu dərs üçün video linki tapılmadı."
          />
          <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex items-center gap-3 px-4">
            <Link
              to={`/tedris/${course.id}`}
              className="pointer-events-auto p-2 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={20} />
            </Link>
            <span className="max-w-[calc(100vw-7rem)] lg:max-w-[calc(100%-5.5rem)] truncate text-white text-sm font-black bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md">
              {activeLesson?.title}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 flex-1">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-4">{activeLesson?.title}</h1>
              <div className="flex items-center gap-4 text-slate-600 text-sm font-bold">
                <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg">Dərs Müddəti: {activeLesson?.duration}</span>
              </div>
            </div>
            <button
              onClick={() => toggleComplete(activeLesson?.id || '')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                activeLesson?.id && completedLessons.includes(activeLesson.id)
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
              disabled={!activeLesson}
            >
              <CheckCircle size={18} /> {activeLesson?.id && completedLessons.includes(activeLesson.id) ? 'Tamamlandı' : 'Tamamlandı kimi qeyd et'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-14">
            <button
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
              onClick={() => {
                const qaBox = document.getElementById('course-player-qa');
                if (qaBox) qaBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <MessageSquare className="text-primary-500" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Sual-Cavab</span>
            </button>
            <button
              className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl hover:bg-slate-50 transition-all border border-slate-200"
              onClick={() => {
                const resourceBox = document.getElementById('course-player-resources');
                if (resourceBox) resourceBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <Download className="text-amber-500" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Resurslar ({courseResources.length})</span>
            </button>
            <button
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all border ${
                canDownloadCertificate
                  ? 'bg-white hover:bg-slate-50 border-slate-200'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
              onClick={handleCertificateDownload}
            >
              <Trophy className="text-emerald-500" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Sertifikat</span>
            </button>
          </div>

          {note ? (
            <div className="mb-6 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700">
              {note}
            </div>
          ) : null}

          <section id="course-player-qa" className="rounded-3xl border border-slate-200 bg-white p-6 mb-8">
            <h2 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
              <MessageSquare size={16} className="text-primary-500" /> Sual-Cavab
            </h2>
            <form onSubmit={handleQuestionSubmit} className="space-y-3">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Sualınızı yazın..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-700"
              >
                Sualı Göndər
              </button>
            </form>
            <div className="mt-5 space-y-3">
              {questions.length === 0 ? (
                <p className="text-slate-500 text-sm font-medium">Hələ sual yoxdur.</p>
              ) : (
                questions.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-bold text-slate-800">{item.text}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{item.createdAt}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section id="course-player-resources" className="rounded-3xl border border-slate-200 bg-white p-6 mb-14">
            <h2 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
              <Download size={16} className="text-amber-500" /> Kurs Resursları
            </h2>

            {courseResources.length === 0 ? (
              <p className="text-slate-500 text-sm font-medium">Bu kurs üçün hələ resurs əlavə edilməyib.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {courseResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all"
                  >
                    <span className="text-sm font-bold pr-3 break-words [overflow-wrap:anywhere]">{resource.title}</span>
                    <ExternalLink size={16} className="text-amber-500 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full lg:w-96 lg:flex-none bg-white border-l border-slate-200 flex flex-col lg:h-full overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-slate-800 font-black flex items-center gap-2 mb-2 uppercase tracking-widest text-sm">
            <List size={18} className="text-primary-500" /> Kursun Məzmunu
          </h3>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-6">
            <div className="bg-primary-600 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[10px] font-black text-slate-500 mt-3 uppercase tracking-widest text-right">Progress: {progressPercent}%</p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          {totalLessons === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-100 text-slate-600 text-sm font-medium">Bu kurs üçün hələ dərs əlavə edilməyib.</div>
          ) : (
            course.modules.map((module) => (
              <div key={module.id}>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">{module.title}</h4>
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all text-left ${
                        activeLesson?.id === lesson.id ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${activeLesson?.id === lesson.id ? 'bg-white/20' : 'bg-slate-200'}`}>
                          {completedLessons.includes(lesson.id) ? <CheckCircle size={14} className="text-emerald-500" /> : <Play size={14} />}
                        </div>
                        <span className="text-xs font-bold leading-tight">{lesson.title}</span>
                      </div>
                      <span className="text-[10px] font-medium opacity-70 ml-4 flex-shrink-0">{lesson.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
