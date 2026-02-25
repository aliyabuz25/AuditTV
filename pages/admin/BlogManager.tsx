import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon,
  Check,
  Save,
  Type,
  Quote,
  List as ListIcon,
  Heading2,
  Layout,
  ChevronUp,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { BlogPost, ContentBlock, BlockType } from '../../types';
import { useSiteData } from '../../site/SiteDataContext';
import QuillEditor from '../../components/QuillEditor';
import { formatBlogDate } from '../../utils/blogDate';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const quillModules = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'blockquote'],
    ['clean'],
  ],
};

const BlogManager: React.FC = () => {
  const { sitemap, saveSection } = useSiteData();
  const [posts, setPosts] = useState<BlogPost[]>(sitemap.blog.posts as BlogPost[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saved, setSaved] = useState(false);
  const [pageHeader, setPageHeader] = useState(sitemap.blog.pageHeader);

  useEffect(() => {
    setPosts(sitemap.blog.posts as BlogPost[]);
    setPageHeader(sitemap.blog.pageHeader);
  }, [sitemap.blog]);

  const categories = ['Vergi', 'Audit', 'Maliyyə', 'HR', 'Etika', 'Tədris'];

  const openEditModal = (post: BlogPost | null = null) => {
    if (post) {
      setEditingPost({
        ...post,
        blocks: post.blocks?.length ? post.blocks : [{ id: 'b1', type: 'paragraph', content: post.excerpt || '' }],
      });
    } else {
      setEditingPost({
        id: Date.now().toString(),
        title: '',
        excerpt: '',
        date: new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' }),
        author: 'İbadət Binyətov',
        imageUrl: '',
        category: 'Vergi',
        status: 'draft',
        blocks: [
          { id: 'b1', type: 'heading', content: 'Giriş Başlığı' },
          { id: 'b2', type: 'paragraph', content: '<p>Məqalə mətni buraya yazılmalıdır...</p>' },
        ],
      });
    }
    setIsModalOpen(true);
  };

  const addBlock = (type: BlockType) => {
    if (!editingPost) return;
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).slice(2),
      type,
      content:
        type === 'list'
          ? '<ul><li>Yeni bənd</li></ul>'
          : type === 'quote'
            ? '<p>Vacib bir sitat...</p>'
            : type === 'heading'
              ? 'Alt başlıq'
              : '<p></p>',
      imageUrl: type === 'image' ? '' : undefined,
      caption: type === 'image' ? '' : undefined,
    };
    setEditingPost({ ...editingPost, blocks: [...editingPost.blocks, newBlock] });
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      blocks: editingPost.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    });
  };

  const moveBlock = (idx: number, dir: 'up' | 'down') => {
    if (!editingPost) return;
    const next = [...editingPost.blocks];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setEditingPost({ ...editingPost, blocks: next });
  };

  const removeBlock = (id: string) => {
    if (!editingPost) return;
    setEditingPost({ ...editingPost, blocks: editingPost.blocks.filter((b) => b.id !== id) });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/api/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) return null;
    const payload = await response.json();
    return payload.url || null;
  };

  const handleSavePost = async () => {
    if (!editingPost) return;

    const firstPara = editingPost.blocks.find((b) => b.type === 'paragraph')?.content || '';
    const plainText = firstPara.replace(/<[^>]*>/g, '').trim().slice(0, 150);
    const finalPost: BlogPost = { ...editingPost, excerpt: plainText ? `${plainText}...` : editingPost.excerpt };

    const nextPosts = posts.find((p) => p.id === finalPost.id)
      ? posts.map((p) => (p.id === finalPost.id ? finalPost : p))
      : [finalPost, ...posts];

    const ok = await saveSection('blog', { pageHeader, posts: nextPosts });
    if (ok) {
      setPosts(nextPosts);
      setIsModalOpen(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <header className="flex justify-between items-center sticky top-0 z-[60] bg-slate-50/80 backdrop-blur-xl py-5 border-b border-slate-200 -mx-10 px-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bloq Redaktoru</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Strukturlaşdırılmış məzmun idarəetməsi</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => openEditModal()} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2">
            <Plus size={18} /> Yeni Yazı
          </button>
          <button
            onClick={async () => {
              const ok = await saveSection('blog', { pageHeader, posts });
              if (ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }
            }}
            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2"
          >
            {saved ? <Check size={18} /> : <Save size={18} />} {saved ? 'Saxlanıldı' : 'Bütününü Saxla'}
          </button>
        </div>
      </header>

      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
          <Layout size={18} className="text-primary-600" /> Bloq Giriş Paneli (Hero)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Giriş Etiketi (Badge)</label>
              <input
                type="text"
                value={pageHeader.badge}
                onChange={(e) => setPageHeader({ ...pageHeader, badge: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-bold text-primary-600 text-xs tracking-widest"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Bloq Başlığı (H1)</label>
              <input
                type="text"
                value={pageHeader.title}
                onChange={(e) => setPageHeader({ ...pageHeader, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 font-black text-slate-900 text-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Bloq İzahı (Subtext)</label>
            <textarea
              rows={3}
              value={pageHeader.sub}
              onChange={(e) => setPageHeader({ ...pageHeader, sub: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-600 font-medium text-sm"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="group bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              {post.imageUrl ? <img src={post.imageUrl} className="w-full h-full object-cover" alt="" /> : null}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${post.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {post.status === 'published' ? 'Yayında' : 'Qaralama'}
                </span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-lg font-black text-slate-900 mb-6 line-clamp-2 h-[3rem]">{post.title}</h3>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatBlogDate(post.date, true)}</span>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(post)} className="p-3 bg-slate-50 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl">
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={async () => {
                      const nextPosts = posts.filter((p) => p.id !== post.id);
                      const ok = await saveSection('blog', { pageHeader, posts: nextPosts });
                      if (ok) setPosts(nextPosts);
                    }}
                    className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingPost ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 lg:p-10">
          <div className="bg-slate-50 w-full h-full lg:rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <aside className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black text-slate-900">Bloq Ayarları</h2>
                <button onClick={() => setIsModalOpen(false)} className="lg:hidden p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Status</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    <button onClick={() => setEditingPost({ ...editingPost, status: 'published' })} className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${editingPost.status === 'published' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}>
                      Yayında
                    </button>
                    <button onClick={() => setEditingPost({ ...editingPost, status: 'draft' })} className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest ${editingPost.status === 'draft' ? 'bg-amber-500 text-white' : 'text-slate-400'}`}>
                      Qaralama
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Kateqoriya</label>
                  <select value={editingPost.category} onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Əsas Şəkil</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingPost.imageUrl}
                      onChange={(e) => setEditingPost({ ...editingPost, imageUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      placeholder="Şəkil URL"
                    />
                    <label className="w-full flex items-center justify-center gap-2 py-3 bg-primary-50 text-primary-700 rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest">
                      <Upload size={14} /> Şəkil Yüklə
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImage(file);
                          if (url) setEditingPost({ ...editingPost, imageUrl: url });
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <button onClick={handleSavePost} className="w-full py-4 bg-primary-600 text-white font-black rounded-2xl flex items-center justify-center gap-3">
                    <Save size={18} /> Yadda Saxla
                  </button>
                </div>
              </div>
            </aside>

            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
              <div className="bg-slate-50 border-b border-slate-200 p-4 sticky top-0 z-50 flex justify-center gap-4">
                <button onClick={() => addBlock('heading')} className="p-3 bg-white border border-slate-200 rounded-xl hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Heading2 size={16} /> Başlıq
                </button>
                <button onClick={() => addBlock('paragraph')} className="p-3 bg-white border border-slate-200 rounded-xl hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Type size={16} /> Paraqraf
                </button>
                <button onClick={() => addBlock('quote')} className="p-3 bg-white border border-slate-200 rounded-xl hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Quote size={16} /> Sitat
                </button>
                <button onClick={() => addBlock('image')} className="p-3 bg-white border border-slate-200 rounded-xl hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <ImageIcon size={16} /> Şəkil
                </button>
                <button onClick={() => addBlock('list')} className="p-3 bg-white border border-slate-200 rounded-xl hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <ListIcon size={16} /> Siyahı
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 lg:px-32 lg:py-20 bg-white">
                <div className="max-w-3xl mx-auto space-y-10">
                  <div className="border-b-2 border-slate-50 pb-8">
                    <input
                      type="text"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                      placeholder="Məqalənin Ana Başlığı..."
                      className="w-full text-4xl lg:text-5xl font-black text-slate-900 border-none outline-none placeholder:text-slate-100"
                    />
                  </div>

                  {editingPost.blocks.map((block, idx) => (
                    <div key={block.id} className="relative group p-4 -mx-4 rounded-[2rem] border border-transparent hover:border-slate-100">
                      <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2">
                        <button onClick={() => moveBlock(idx, 'up')} className="p-2 bg-white rounded-lg border border-slate-200 hover:text-primary-600"><ChevronUp size={14} /></button>
                        <button onClick={() => moveBlock(idx, 'down')} className="p-2 bg-white rounded-lg border border-slate-200 hover:text-primary-600"><ChevronDown size={14} /></button>
                        <button onClick={() => removeBlock(block.id)} className="p-2 bg-white rounded-lg border border-red-100 text-red-400 hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
                      </div>

                      {block.type === 'heading' ? (
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="Alt Başlıq..."
                          className="w-full text-2xl font-black text-slate-900 bg-transparent border-none outline-none"
                        />
                      ) : null}

                      {block.type === 'paragraph' ? (
                        <QuillEditor modules={quillModules} value={block.content || '<p></p>'} onChange={(value) => updateBlock(block.id, { content: value })} />
                      ) : null}

                      {block.type === 'quote' ? (
                        <div className="border-l-4 border-primary-600 pl-4 py-2 bg-primary-50/30 rounded-r-2xl">
                          <QuillEditor modules={quillModules} value={block.content || '<p></p>'} onChange={(value) => updateBlock(block.id, { content: value })} />
                        </div>
                      ) : null}

                      {block.type === 'list' ? (
                        <QuillEditor
                          modules={{ toolbar: [[{ list: 'ordered' }, { list: 'bullet' }], ['bold', 'italic'], ['clean']] }}
                          value={block.content || '<ul><li></li></ul>'}
                          onChange={(value) => updateBlock(block.id, { content: value })}
                        />
                      ) : null}

                      {block.type === 'image' ? (
                        <div className="space-y-4">
                          <div className="aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-100 relative">
                            {block.imageUrl ? <img src={block.imageUrl} className="w-full h-full object-cover" alt="" /> : null}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={block.imageUrl || ''}
                              onChange={(e) => updateBlock(block.id, { imageUrl: e.target.value })}
                              placeholder="Blok Şəkli URL..."
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs"
                            />
                            <label className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest">
                              <Upload size={14} /> Şəkil Yüklə
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const url = await uploadImage(file);
                                  if (url) updateBlock(block.id, { imageUrl: url });
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            value={block.caption || ''}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            placeholder="Şəkil alt yazısı..."
                            className="w-full text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-transparent border-none outline-none"
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 z-[80] p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 shadow-xl hidden lg:block">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BlogManager;
