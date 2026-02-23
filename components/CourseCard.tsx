import React from 'react';
import { Course } from '../types';
import { Clock, Star, PlayCircle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-neutral-950 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group">
      <div className="relative aspect-video">
        <img 
          src={course.thumbnailUrl} 
          alt={course.title} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <PlayCircle className="w-12 h-12 text-white" fill="currentColor" />
        </div>
        <div className="absolute top-3 left-3 bg-neutral-900/80 px-2 py-1 rounded text-xs font-medium text-white border border-white/10">
          {course.level}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
           <span className="text-main font-bold">{course.price.toFixed(2)} ₼</span>
           <div className="flex items-center gap-1 text-gold-500 text-xs font-bold">
             <Star size={12} fill="currentColor" /> {course.rating}
           </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-main transition-colors">{course.title}</h3>
        
        <div className="flex items-center justify-between mt-6 text-xs text-neutral-500 font-medium">
           <span className="flex items-center gap-1.5">
             <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-white">
               {course.instructor.charAt(0)}
             </div>
             {course.instructor}
           </span>
           <span className="flex items-center gap-1">
             <Clock size={12} /> {course.duration}
           </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;