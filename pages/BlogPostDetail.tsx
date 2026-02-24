
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Facebook, MessageCircle, Quote as QuoteIcon } from 'lucide-react';
import { BlogPost, ContentBlock } from '../types';
import { useSiteData } from '../site/SiteDataContext';
import { formatBlogDate } from '../utils/blogDate';

const setMetaTag = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const setCanonicalUrl = (url: string) => {
  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { sitemap } = useSiteData();
  const BLOG_POSTS = sitemap.blog.posts;
  // Cast for compatibility with blocks
  const post = BLOG_POSTS.find(p => p.id === id) as unknown as BlogPost;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(post?.title || '');
  const shareTargets = [
    {
      key: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: 'Facebook-da paylaş',
      icon: <Facebook size={18} />,
      className: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      key: 'x',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      label: 'X-də paylaş',
      icon: <span className="text-sm font-black leading-none">X</span>,
      className: 'hover:bg-slate-900 hover:text-white',
    },
    {
      key: 'whatsapp',
      href: `https://wa.me/?text=${encodeURIComponent(`${post?.title || ''} ${pageUrl}`.trim())}`,
      label: 'WhatsApp-da paylaş',
      icon: <MessageCircle size={18} />,
      className: 'hover:bg-[#25D366] hover:text-white',
    },
  ];

  useEffect(() => {
    if (!post) return;

    const siteName = sitemap.settings?.branding?.siteName || 'audit.tv';
    const canonicalBase = (sitemap.settings?.seo?.canonicalUrl || '').replace(/\/$/, '');
    const pageUrlForMeta = pageUrl || `${canonicalBase}/#/blog/${post.id}`;
    const rawDescription =
      post.excerpt ||
      post.blocks?.find((b) => b.type === 'paragraph')?.content?.replace(/<[^>]+>/g, ' ') ||
      '';
    const description = String(rawDescription).replace(/\s+/g, ' ').trim().slice(0, 300);
    const imageUrl = post.imageUrl?.startsWith('http')
      ? post.imageUrl
      : `${window.location.origin}${post.imageUrl || ''}`;

    document.title = `${post.title} | ${siteName}`;
    setCanonicalUrl(pageUrlForMeta);
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'article');
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', post.title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', pageUrlForMeta);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', imageUrl);
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', post.title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
  }, [post, pageUrl, sitemap.settings]);

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
                   <Calendar size={16} className="text-primary-600" /> {formatBlogDate(post.date)}
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
                   {shareTargets.map((item) => (
                      <a
                        key={item.key}
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all shadow-sm ${item.className}`}
                      >
                        {item.icon}
                      </a>
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
