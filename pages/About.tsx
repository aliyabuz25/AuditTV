
import React from 'react';
import { Building2, ShieldCheck, TrendingUp, Award, Users, BookOpen, Target, Globe, Lightbulb, CheckCircle2, ArrowRight, Briefcase, GraduationCap, History, Cpu, Shield, UserCheck, Sparkles, Rocket, Zap } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';

const AboutPage: React.FC = () => {
  const { sitemap } = useSiteData();
  const { about } = sitemap;

  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero Section - High Impact */}
      <section className="relative pt-32 lg:pt-48 pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
           <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] bg-primary-50 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-50 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-primary-50 border border-primary-100">
                   <Award size={14} className="text-primary-600" />
                   <span className="text-[10px] font-black tracking-[0.2em] text-primary-700 uppercase">{about.hero.badge}</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.05]">
                  {about.hero.title} <br/><span className="text-primary-600">{about.hero.spanTitle}</span>
                </h1>
                
                <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
                  {about.hero.sub}
                </p>

                <div className="flex flex-wrap gap-8">
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-slate-900">{about.hero.stat1Year}</span>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{about.hero.stat1Label}</span>
                   </div>
                   <div className="w-px h-12 bg-slate-100 hidden sm:block"></div>
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-primary-600">{about.hero.stat2Val}</span>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{about.hero.stat2Label}</span>
                   </div>
                   <div className="w-px h-12 bg-slate-100 hidden sm:block"></div>
                   <div className="flex flex-col">
                      <span className="text-4xl font-black text-emerald-600">{about.hero.stat3Val}</span>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{about.hero.stat3Label}</span>
                   </div>
                </div>
             </div>
             
             <div className="relative">
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
                   <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="Team working" />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-6 -left-6 bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-800 z-20 hidden md:block">
                   <p className="text-white text-3xl font-black mb-1">{about.hero.satisfactionRate}</p>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{about.hero.satisfactionLabel}</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Narrative Section - Who We Are */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="max-w-3xl mb-20">
              <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight uppercase tracking-widest text-sm opacity-50 border-l-4 border-primary-600 pl-6">{about.narrative.title}</h2>
              <p className="text-2xl font-bold text-slate-800 leading-snug">
                {about.narrative.quote}
              </p>
        </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-8">
                 <p className="text-lg text-slate-600 leading-relaxed font-medium">
                   {about.narrative.para1}
                 </p>
                 <p className="text-lg text-slate-600 leading-relaxed font-medium">
                   {about.narrative.para2}
                 </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {about.values.map((item, idx) => {
                    const iconMap: Record<string, any> = { ShieldCheck, Lightbulb, Globe, Target };
                    const ItemIcon = iconMap[item.icon] || ShieldCheck;
                    return (
                    <div key={idx} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:border-primary-100 transition-all group min-w-0">
                       <ItemIcon className="text-primary-600 mb-6 group-hover:scale-110 transition-transform" size={32} />
                       <h4 className="text-lg font-black text-slate-900 mb-2 [overflow-wrap:anywhere]">{item.title}</h4>
                       <p className="text-sm text-slate-500 font-medium leading-relaxed [overflow-wrap:anywhere]">{item.desc}</p>
                    </div>
                 )})}
              </div>
           </div>
        </div>
      </section>

      {/* Why Audit TV? Section (Matching Site Colors) */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24">
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                  {about.whyUs.title} <span className="text-primary-600">{about.whyUs.spanTitle}</span>
               </h2>
               <div className="w-24 h-1.5 bg-primary-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {about.whyUs.items.map((item, idx) => {
                  const iconMap: Record<string, any> = { Cpu, Shield, UserCheck };
                  const ItemIcon = iconMap[item.icon] || Cpu;
                  return (
                  <div key={idx} className="group bg-white p-12 rounded-[3rem] edu-card-shadow border border-slate-100 hover:border-primary-200 transition-all duration-500 relative overflow-hidden h-full">
                     <div className="absolute top-8 right-8 text-5xl font-black text-slate-50 opacity-10 group-hover:opacity-20 transition-opacity">
                        {item.number}
                     </div>
                     <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                        <ItemIcon size={30} />
                     </div>
                     <h4 className="text-2xl font-black text-slate-900 mb-6 leading-tight">{item.title}</h4>
                     <p className="text-slate-500 font-medium leading-relaxed">
                        {item.desc}
                     </p>
                  </div>
               )})}
            </div>
         </div>
      </section>

      {/* Vision 2030 - Restored without buttons */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                 <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8">
                       <Rocket size={16} className="text-primary-400" />
                       <span className="text-[10px] font-black tracking-widest text-primary-400 uppercase">{about.vision.badge}</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
                       {about.vision.title} <span className="text-primary-500">{about.vision.spanTitle}</span>
                    </h2>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12">
                       {about.vision.sub}
                    </p>
                    
                    <div className="space-y-6">
                       {about.vision.goals.map((goal, i) => (
                         <div key={i} className="flex items-center gap-4 text-white">
                            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                               <CheckCircle2 size={14} />
                            </div>
                            <span className="text-lg font-bold">{goal}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="hidden lg:flex items-center justify-center">
                    <div className="relative">
                       <div className="text-[15rem] font-black text-white/5 select-none leading-none">2030</div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Zap size={120} className="text-primary-500 opacity-20 group-hover:scale-125 transition-transform duration-1000" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Team - The Faces of audit.tv */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-24">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Ekspert Komandamız</h2>
              <p className="text-slate-500 font-medium text-lg">Maliyyə sahəsində peşəkarların rəhbərliyi ilə inkişaf edin</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {about.team.map(member => (
                 <div key={member.id} className="group bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 hover:edu-card-shadow transition-all duration-700">
                    <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000 relative">
                       <img src={member.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={member.name} />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-12">
                       <h4 className="text-2xl font-black text-slate-900 mb-2">{member.name}</h4>
                       <p className="text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{member.role}</p>
                       <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">{member.bio}</p>
                       
                       <div className="flex gap-4 border-t border-slate-200 pt-8">
                          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 transition-colors">LinkedIn Profile</button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
