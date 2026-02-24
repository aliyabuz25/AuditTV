
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Quote as QuoteIcon } from 'lucide-react';
import { BlogPost, ContentBlock } from '../types';
import { useSiteData } from '../site/SiteDataContext';

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sitemap } = useSiteData();
  const BLOG_POSTS = sitemap.blog.posts;
  // Cast for compatibility with blocks
  const post = BLOG_POSTS.find(p => p.id === id) as unknown as BlogPost;

  if (!post) return <div className="text-slate-900 p-20 text-center font-black">Məqalə tapılmadı</div>;

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/blog" className="inline-flex items-center text-slate-400 hover:text-primary-600 mb-12 text-xs font-black uppercase tracking-widest transition-colors group">
             <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Bloqa qayıt
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tighter">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-end border-y border-slate-100 py-8 mb-16">
             <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                   <Calendar size={16} className="text-primary-600" /> {post.date}
                </div>
                <div className="flex items-center gap-2">
                   <Clock size={16} className="text-primary-600" /> 5 DƏQ
                </div>
             </div>
          </div>

          {/* MAIN ARTICLE CONTENT - RENDER BLOCKS */}
          <article className="space-y-12">
             {post.blocks && post.blocks.length > 0 ? (
               post.blocks.map((block: ContentBlock) => {
                 switch (block.type) {
                    case 'heading':
                       return <h2 key={block.id} className="text-3xl font-black text-slate-900 pt-8 tracking-tight">{block.content}</h2>;
                    
                    case 'paragraph':
                       return <div key={block.id} className="text-xl text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: block.content }} />;
                    
                    case 'quote':
                       return (
                          <div key={block.id} className="relative py-10 px-12 bg-slate-50 rounded-[3rem] border border-slate-100">
                             <QuoteIcon className="absolute top-8 left-8 text-primary-600/10" size={80} />
                             <p className="text-2xl font-black text-slate-800 italic leading-tight relative z-10">
                                "{block.content}"
                             </p>
                          </div>
                       );
                    
                    case 'image':
                       return (
                          <figure key={block.id} className="space-y-4">
                             <div className="rounded-[3.5rem] overflow-hidden shadow-2xl shadow-slate-200">
                                <img src={block.imageUrl} className="w-full object-cover" alt={block.caption} />
                             </div>
                             {block.caption && <figcaption className="text-center text-xs font-black text-slate-400 uppercase tracking-widest">{block.caption}</figcaption>}
                          </figure>
                       );
                    
                    case 'list':
                       return (
                          <ul key={block.id} className="space-y-4 list-disc pl-8 text-xl text-slate-600 font-medium marker:text-primary-600" dangerouslySetInnerHTML={{ __html: block.content }} />
                       );
                    
                    default:
                       return null;
                 }
               })
             ) : (
                // Fallback to excerpt if no blocks
                <p className="text-xl text-slate-600 leading-relaxed font-medium">{post.excerpt}</p>
             )}
          </article>

          <div className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paylaş:</span>
                <div className="flex gap-3">
                   {[1, 2, 3].map(i => (
                      <button key={i} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
                         <Share2 size={18} />
                      </button>
                   ))}
                </div>
             </div>
             <Link to="/blog" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                Digər Analizlər
             </Link>
          </div>
       </div>
    </div>
  );
};

export default BlogPostDetail;
