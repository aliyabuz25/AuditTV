import React from 'react';
import ServiceCard from '../components/ServiceCard';
import { useSiteData } from '../site/SiteDataContext';

const ServicesPage: React.FC = () => {
  const { sitemap } = useSiteData();
  const SERVICES = sitemap.services;
  return (
    <div className="bg-neutral-900 min-h-screen text-white">
      {/* Header */}
      <div className="bg-neutral-950 border-b border-white/5 pt-24 pb-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Xidmətlər</h1>
            <p className="text-xl text-neutral-400 max-w-2xl font-light">Peşəkar audit və maliyyə xidmətləri ilə biznesinizin potensialını maksimuma çatdırın.</p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
