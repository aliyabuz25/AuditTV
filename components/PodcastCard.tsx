
import React from 'react';
import { PodcastEpisode } from '../types';
import { Play, Clock, Calendar } from 'lucide-react';

interface PodcastCardProps {
  episode: PodcastEpisode;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ episode }) => {
  return (
    <div className="group relative bg-neutral-950 border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300">
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={episode.thumbnailUrl} 
          alt={episode.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-90"></div>
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-main hover:border-main">
             <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
           <div className="flex items-center gap-3 text-xs text-neutral-300 mb-2 font-medium">
              <span className="flex items-center gap-1"><Calendar size={12} /> {episode.date}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {episode.duration}</span>
           </div>
           <p className="text-white font-medium text-sm">Host: {episode.host}</p>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-main transition-colors">
          {episode.title}
        </h3>
        <p className="text-neutral-500 text-sm line-clamp-2">
          {episode.description}
        </p>
        <button className="mt-4 flex items-center gap-2 text-sm font-bold text-white group-hover:text-main transition-colors">
           <Play size={14} fill="currentColor" /> İndi Dinlə
        </button>
      </div>
    </div>
  );
};

export default PodcastCard;
