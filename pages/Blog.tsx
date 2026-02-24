
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Clock, BookOpen, Filter } from 'lucide-react';
import { useSiteData } from '../site/SiteDataContext';
import { formatBlogDate } from '../utils/blogDate';

const BlogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('HAMISI');
  const [searchQuery, setSearchQuery] = useState('');
  const { sitemap } = useSiteData();
  const BLOG_POSTS = sitemap.blog.posts;

  const categories = ['HAMISI', ...Array.from(new Set(BLOG_POSTS.map((post) => post.category.toUpperCase())))];

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'HAMISI' || post.category.toUpperCase() === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Unified Header - Symmetric Layout */}
      <div className="bg-white border-b border-slate-100 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="max-w-2xl w-full">
              <div className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-[10px] mb-4">
                 <BookOpen size={16} /> {sitemap.blog.pageHeader.badge}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">{sitemap.blog.pageHeader.title}</h1>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">{sitemap.blog.pageHeader.sub}</p>
            </div>
            
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Məqalə axtarışı..."
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
        {/* Category Filters below Header */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4 no-scrollbar">
          <div className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 mr-2">
            <Filter size={18} />
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-primary-200 hover:text-primary-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id} className="group flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden edu-card-shadow transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-1.5 bg-primary-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary-600" />
                        <span>{formatBlogDate(post.date, true)}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock size={14} className="text-primary-600" />
                        <span>5 DƏQ OXU</span>
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
            <Search size={48} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-xl font-black text-slate-900 mb-2">Məqalə tapılmadı</h3>
            <p className="text-slate-400 font-medium">Axtarış meyarlarını dəyişərək yenidən yoxlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
