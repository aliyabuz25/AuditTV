
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Star, Clock, Users } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';

const EducationPage: React.FC = () => {
  const [filter, setFilter] = useState('Hamısı');
  const [searchQuery, setSearchQuery] = useState('');
  const { sitemap } = useSiteData();
  const COURSES = sitemap.education.courses;
  const filters = ['Hamısı', 'Başlanğıc', 'Orta', 'İrəli'];

  const filteredCourses = COURSES.filter((course) => {
    const matchesLevel = filter === 'Hamısı' || course.level === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q) ||
      course.instructor.toLowerCase().includes(q);
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-white border-b border-slate-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-xs mb-4">
                 <BookOpen size={16} /> {sitemap.education.pageHeader.badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">{sitemap.education.pageHeader.title}</h1>
              <p className="text-slate-500 text-lg font-medium">{sitemap.education.pageHeader.sub}</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Kurs axtarışı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/5 transition-all font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 mr-2">
            <Filter size={18} />
          </div>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                filter === f 
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <Link key={course.id} to={`/tedris/${course.id}`} className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden edu-card-shadow transition-all hover:-translate-y-2 flex flex-col">
                 <div className="aspect-video relative overflow-hidden">
                    <ImageWithPlaceholder
                      src={course.thumbnailUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={course.title}
                    />
                    <div className="absolute top-4 left-4">
                       <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest">{course.level}</span>
                    </div>
                 </div>
                 <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          <Star size={14} fill="currentColor" /> {course.rating}
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                          <Users size={14} /> {course.studentCount} Tələbə
                       </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight min-h-[3rem]">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium">{course.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Təlimçi</p>
                          <p className="text-sm font-bold text-slate-900">{course.instructor}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-2xl font-black text-primary-600">{course.price} ₼</p>
                       </div>
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100">
            <Search size={44} className="mx-auto text-slate-200 mb-5" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Kurs tapılmadı</h3>
            <p className="text-slate-400 font-medium">Axtarış və filtr meyarlarını dəyişərək yenidən yoxlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationPage;
