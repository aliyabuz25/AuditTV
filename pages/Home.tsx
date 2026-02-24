
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calculator, Users, Briefcase, TrendingUp, FileText, ArrowRight, BookOpen, GraduationCap, PlayCircle, Star, Sparkles, Mic, Play, Clock, Download, FileCheck, HelpCircle, AlertCircle, Cpu, Mail, ChevronDown, Check, Video, List, Calendar, Headphones, PieChart, UserCheck } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import { useToast } from '../components/ToastProvider';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';

const IconMap: any = {
  ShieldCheck, Calculator, Users, Briefcase, TrendingUp, FileText, AlertCircle, Cpu
};
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const Home: React.FC = () => {
  const { sitemap } = useSiteData();
  const toast = useToast();
  const BLOG_POSTS = Array.isArray(sitemap.blog.posts) ? sitemap.blog.posts : [];
  const featuredBlog = BLOG_POSTS[0] || null;
  const sidebarBlogs = BLOG_POSTS.slice(1, 5);
  const PODCAST_EPISODES = sitemap.podcast.episodes;
  const FINANCIAL_FACTS = sitemap.financialFacts;
  const FAQS = sitemap.faq.faqs;
  const { home } = sitemap;

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') || '').trim();
    if (!email) {
      toast.error('E-poçt ünvanını daxil edin.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newsletter',
          email,
          subject: 'Newsletter abunəliyi',
        }),
      });

      if (!response.ok) {
        throw new Error('Abunəlik qeydə alınmadı');
      }

      toast.success('Abunəliyiniz qeydə alındı. Yenilikləri e-poçtla göndərəcəyik.');
      e.currentTarget.reset();
    } catch {
      toast.error('Abunəlik zamanı xəta baş verdi. Yenidən cəhd edin.');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-16 bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] bg-primary-50 rounded-full blur-[120px] opacity-40"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
             <div className="lg:w-3/5">
                {/* Removed the badge as per request */}
                
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.05]">
                  {home.hero.title}
                </h1>
                
                <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
                  {home.hero.sub}
                </p>

                <div className="flex flex-wrap gap-5">
                   <Link to={home.hero.btn1Link} className="px-10 py-5 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center gap-3">
                     {home.hero.btn1Text} <ArrowRight size={20} />
                   </Link>
                   <Link to={home.hero.btn2Link} className="px-10 py-5 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-3">
                     {home.hero.btn2Text}
                   </Link>
                </div>
             </div>

             {/* Quick Benefit Card */}
             <div className="lg:w-2/5 w-full">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative shadow-2xl">
                   <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-600 rounded-2xl rotate-12 flex items-center justify-center shadow-xl">
                      <Download size={40} className="text-white -rotate-12" />
                   </div>
                   <h3 className="text-2xl font-black mb-4">{home.benefit.header}</h3>
                   <p className="text-slate-400 mb-8 font-medium">{home.benefit.desc}</p>
                   <ul className="space-y-4 mb-10">
                      {home.benefit.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 text-sm font-bold">
                           <FileCheck className="text-primary-500" size={18} /> {item.text}
                        </li>
                      ))}
                   </ul>
                   {home.benefit.fileUrl ? (
                     <a
                       href={home.benefit.fileUrl}
                       target="_blank"
                       rel="noreferrer"
                       className="block w-full py-4 bg-white text-slate-900 rounded-xl font-black hover:bg-primary-50 transition-colors text-center"
                     >
                       {home.benefit.btnText}
                     </a>
                   ) : (
                     <button className="w-full py-4 bg-white text-slate-900 rounded-xl font-black hover:bg-primary-50 transition-colors">
                        {home.benefit.btnText}
                     </button>
                   )}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* New Section: Who is this for? (Replacing Stats) */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-16 tracking-tight">{home.headers.targetsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {home.targets.map((item, idx) => {
                  const iconMap: Record<string, any> = { Briefcase, Calculator, PieChart, UserCheck };
                  const colors = ['bg-blue-500', 'bg-primary-600', 'bg-indigo-600', 'bg-emerald-600'];
                  const ItemIcon = iconMap[item.icon] || Briefcase;
                  return (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] edu-card-shadow border border-slate-100 group hover:border-primary-200 transition-all">
                     <div className={`w-14 h-14 ${colors[idx % colors.length]} text-white rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform`}>
                        <ItemIcon size={28} />
                     </div>
                     <h4 className="text-xl font-black text-slate-900 mb-4">{item.title}</h4>
                     <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
               )})}
            </div>
         </div>
      </section>

      {/* Podcast Cards Section */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <div>
                  <div className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-xs mb-4">
                     <Mic size={16} /> {home.podcastSection.badge}
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{home.podcastSection.title}</h2>
                  <p className="text-slate-500 font-medium mt-4 text-lg">{home.podcastSection.sub}</p>
               </div>
               <Link to="/podcast" className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                  <Headphones size={20} /> {home.podcastSection.btnText}
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {PODCAST_EPISODES.map(episode => (
                  <div key={episode.id} className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:edu-card-shadow transition-all duration-300 flex flex-col h-full">
                     <div className="aspect-video relative overflow-hidden">
                        <img src={episode.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={episode.title} />
                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-16 h-16 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-all">
                              <Play className="text-primary-600 ml-1" size={28} fill="currentColor" />
                           </div>
                        </div>
                     </div>
                     <div className="p-10 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                           <span className="flex items-center gap-1.5"><Calendar size={14} /> {episode.date}</span>
                           <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                           <span className="flex items-center gap-1.5"><Clock size={14} /> {episode.duration}</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight flex-1">
                          {episode.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8">
                          {episode.description}
                        </p>
                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Host: {episode.host}</span>
                           <button className="text-primary-600 font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                              İndi Dinlə <Play size={16} fill="currentColor" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Financial Facts - Bilik Sandığı */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase tracking-widest">{home.headers.factsTitle}</h2>
               <p className="text-slate-500 font-medium">{home.headers.factsSub}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {FINANCIAL_FACTS.map(fact => {
                  const Icon = IconMap[fact.icon];
                  return (
                     <div key={fact.id} className="bg-white p-8 rounded-[2rem] edu-card-shadow border border-slate-100 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Icon size={80} />
                        </div>
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mb-6">
                           <Icon size={24} />
                        </div>
                        <p className="text-slate-700 font-bold leading-relaxed">{fact.text}</p>
                     </div>
                  );
               })}
            </div>
         </div>
      </section>

      {/* Featured Articles */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-end mb-16">
              <div>
                 <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{home.headers.blogTitle}</h2>
                 <p className="text-slate-500 font-medium text-lg">{home.headers.blogSub}</p>
              </div>
              <Link to="/blog" className="hidden sm:flex text-primary-600 font-black items-center gap-2 hover:translate-x-1 transition-transform">
                 Hamısını Oxu <ArrowRight size={20} />
              </Link>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                 {featuredBlog ? (
                   <Link to={`/blog/${featuredBlog.id}`} className="group block bg-white rounded-[2.5rem] overflow-hidden edu-card-shadow border border-slate-100 h-full">
                      <div className="aspect-[21/10] overflow-hidden">
                         <ImageWithPlaceholder
                           src={featuredBlog.imageUrl}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                           alt={featuredBlog.title}
                         />
                      </div>
                      <div className="p-10">
                         <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-widest rounded-lg">{featuredBlog.category}</span>
                            <span className="text-slate-300 text-sm font-medium">{featuredBlog.date}</span>
                         </div>
                         <h3 className="text-4xl font-black text-slate-900 mb-6 group-hover:text-primary-600 transition-colors tracking-tight">
                           {featuredBlog.title}
                         </h3>
                         <p className="text-slate-600 text-lg leading-relaxed mb-8">
                           {featuredBlog.excerpt}
                         </p>
                      </div>
                   </Link>
                 ) : (
                   <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 h-full flex items-center justify-center text-slate-400 font-bold">
                     Hazirda blog melumati yoxdur.
                   </div>
                 )}
              </div>

              <div className="lg:col-span-4 flex flex-col gap-6">
                 {sidebarBlogs.map(post => (
                   <Link key={post.id} to={`/blog/${post.id}`} className="group p-5 bg-white rounded-3xl border border-slate-100 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-100/10 transition-all flex gap-5">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100">
                         <ImageWithPlaceholder src={post.imageUrl} className="w-full h-full object-cover" alt={post.title} />
                      </div>
                      <div className="flex flex-col justify-center">
                         <span className="text-[10px] font-black text-primary-600 uppercase mb-1">{post.category}</span>
                         <h4 className="font-black text-slate-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                           {post.title}
                         </h4>
                         <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                      </div>
                   </Link>
                 ))}
                 
                 <Link to="/blog" className="mt-auto p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col justify-between group">
                    <BookOpen size={40} className="mb-8 opacity-50" />
                    <div>
                       <h4 className="text-xl font-black mb-2">{home.headers.blogCardTitle}</h4>
                       <p className="text-slate-400 text-sm mb-6">{home.headers.blogCardSub}</p>
                       <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center group-hover:w-full transition-all duration-300 overflow-hidden">
                          <ArrowRight size={20} className="flex-shrink-0" />
                       </div>
                    </div>
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
         <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{home.headers.faqTitle}</h2>
               <p className="text-slate-500 font-medium">{home.headers.faqSub}</p>
            </div>
            <div className="space-y-6">
               {FAQS.map((faq, i) => (
                  <div key={i} className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                     <div className="p-8 flex items-start gap-4 cursor-pointer hover:bg-slate-100/50 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                           <HelpCircle size={18} />
                        </div>
                        <div>
                           <h4 className="font-black text-slate-900 mb-4 text-lg">{faq.q}</h4>
                           <p className="text-slate-600 leading-relaxed font-medium">{faq.a}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-primary-600 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 border-4 border-white rounded-full"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 border-8 border-white rounded-full"></div>
         </div>
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
               <Mail size={40} />
            </div>
            <h2 className="text-4xl font-black mb-6">{home.headers.newsTitle}</h2>
            <p className="text-xl text-primary-50 font-medium mb-12 opacity-80">
               {home.headers.newsSub}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
               <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="E-poçt ünvanınız" 
                  className="flex-grow bg-white/10 border border-white/20 rounded-2xl px-8 py-5 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 font-bold"
               />
               <button type="submit" className="px-10 py-5 bg-white text-primary-600 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-2xl flex items-center justify-center gap-2">
                  {home.headers.newsBtnText} <Check size={20} />
               </button>
            </form>
         </div>
      </section>

    </div>
  );
};

export default Home;
