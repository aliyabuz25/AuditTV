import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sitemap } = useSiteData();
  const SERVICES = sitemap.services;
  const service = SERVICES.find(s => s.id === id);

  if (!service) return <div className="text-white p-20 text-center">Tapılmadı</div>;

  return (
    <div className="bg-neutral-900 min-h-screen text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
               <h1 className="text-4xl font-bold mb-6">{service.title}</h1>
               <div className="aspect-video rounded-xl overflow-hidden mb-8">
                  <img src={service.imageUrl} className="w-full h-full object-cover" alt={service.title} />
               </div>
               <div className="prose prose-invert max-w-none text-neutral-300">
                  <p className="text-lg leading-relaxed mb-6">{service.description}</p>
                  <p>Bu xidmət çərçivəsində...</p>
               </div>
            </div>

            <div className="lg:col-span-1">
               <div className="bg-neutral-950 border border-white/5 rounded-xl p-8 sticky top-24">
                  <h3 className="text-xl font-bold mb-6">Xidmətə daxildir:</h3>
                  <ul className="space-y-4 mb-8">
                     {[1,2,3,4].map(i => (
                        <li key={i} className="flex items-start gap-3 text-neutral-400 text-sm">
                           <CheckCircle className="w-5 h-5 text-main flex-shrink-0" />
                           <span>Peşəkar analiz və hesabatlılıq #{i}</span>
                        </li>
                     ))}
                  </ul>
                  <Link to="/elaqe" className="block w-full text-center bg-white text-black font-bold py-3 rounded hover:bg-neutral-200 transition-colors">
                     Sifariş Et
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
