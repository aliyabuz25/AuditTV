import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../types';
import { ShieldCheck, Calculator, Users, FileText, TrendingUp, Briefcase, ArrowRight } from 'lucide-react';

const IconMap = {
  ShieldCheck,
  Calculator,
  Users,
  FileText,
  TrendingUp,
  Briefcase
};

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const IconComponent = IconMap[service.iconName];

  return (
    <Link 
      to={`/xidmetler/${service.id}`}
      className="group block h-full bg-neutral-950 border border-white/5 hover:border-white/20 transition-all duration-300 rounded-xl overflow-hidden"
    >
      <div className="h-56 relative overflow-hidden">
        <img 
          src={service.imageUrl} 
          alt={service.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0 opacity-80"
        />
        <div className="absolute inset-0 bg-neutral-900/50 group-hover:bg-neutral-900/20 transition-colors"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-white text-neutral-900 rounded-lg flex items-center justify-center shadow-lg">
           <IconComponent size={24} strokeWidth={1.5} />
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-main transition-colors">
          {service.title}
        </h3>
        
        <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">
          {service.description}
        </p>

        <div className="flex items-center text-white text-sm font-semibold group-hover:gap-2 transition-all">
          <span>Ətraflı bax</span>
          <ArrowRight className="ml-2 w-4 h-4 text-main" />
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;