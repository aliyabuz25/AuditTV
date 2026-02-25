import React from 'react';
import { useSiteData } from '../site/SiteDataContext';

const TermsOfUsePage: React.FC = () => {
  const { sitemap } = useSiteData();
  const terms = sitemap.termsOfUse;

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm space-y-8">
          <header className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{terms.title}</h1>
            <p className="text-sm text-slate-500 font-medium">
              Son yenilənmə: {terms.updatedAt}
            </p>
            <p className="text-slate-600 leading-relaxed">{terms.intro}</p>
          </header>

          {terms.sections.map((section, index) => (
            <section key={`${section.title}-${index}`} className="space-y-4 text-slate-700 leading-relaxed">
              <h2 className="text-xl font-black text-slate-900">
                {index + 1}. {section.title}
              </h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
