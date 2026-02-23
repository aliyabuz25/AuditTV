const API = 'http://127.0.0.1:3001';
const d = new Date().toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });

const demoBlogs = [
  {
    id: 'demo-blog-1',
    title: 'Kiçik Bizneslər üçün Vergi Risk Xəritəsi',
    excerpt: '2026 üçün ən çox rast gəlinən vergi risklərini və praktik qarşı tədbirləri izah edirik.',
    date: d,
    author: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200',
    category: 'Vergi',
    status: 'published',
    blocks: [
      { id: 'b1', type: 'heading', content: 'Risklər Harada Yaranır?' },
      { id: 'b2', type: 'paragraph', content: '<p>Vergi risklərinin böyük hissəsi sənədləşmə intizamındakı boşluqlardan başlayır.</p>' }
    ]
  },
  {
    id: 'demo-blog-2',
    title: 'Daxili Audit üçün 90 Günlük Plan',
    excerpt: 'Şirkət daxilində audit sistemini sıfırdan qurmaq üçün mərhələli plan.',
    date: d,
    author: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    category: 'Audit',
    status: 'published',
    blocks: [
      { id: 'b1', type: 'heading', content: 'İlk 30 Gün' },
      { id: 'b2', type: 'paragraph', content: '<p>Proses xəritəsi çıxarılır və nəzarət nöqtələri təyin edilir.</p>' }
    ]
  },
  {
    id: 'demo-blog-3',
    title: 'Cashflow Analizi: Sadə Model',
    excerpt: 'Nağd axının idarəsi üçün komandaların dərhal istifadə edə biləcəyi model.',
    date: d,
    author: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    category: 'Maliyyə',
    status: 'published',
    blocks: [
      { id: 'b1', type: 'paragraph', content: '<p>Aylıq cashflow hesabatı qərarvermənin sürətini artırır.</p>' }
    ]
  }
];

const demoEpisodes = [
  {
    id: 'demo-ep-1',
    title: 'Vergi Yoxlamasına Hazırlıq Checklisti',
    description: 'Yoxlama öncəsi komandanın atmalı olduğu praktik addımlar.',
    duration: '28 dəq',
    date: d,
    host: 'Admin',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?auto=format&fit=crop&q=80&w=1200',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'demo-ep-2',
    title: 'IFRS Keçidində 5 Kritik Nöqtə',
    description: 'Maliyyə komandalarının ən çox səhv etdiyi keçid mərhələləri.',
    duration: '31 dəq',
    date: d,
    host: 'Admin',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80&w=1200',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: 'demo-ep-3',
    title: 'Audit Komandasının KPI-ları',
    description: 'Effektiv audit performansı üçün ölçülə bilən göstəricilər.',
    duration: '24 dəq',
    date: d,
    host: 'Admin',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

const get = await fetch(API + '/api/sitemap');
const payload = await get.json();
const sitemap = payload?.sitemap || {};

const blog = sitemap.blog || {
  pageHeader: {
    badge: 'EKSPERT BLOQU',
    title: 'Faydalı Məqalələr və Analizlər',
    sub: 'Günün ən vacib maliyyə və vergi mövzuları haqqında peşəkar rəylər.'
  },
  posts: []
};

const podcast = sitemap.podcast || {
  pageHeader: {
    badge: 'AUDİT.TV PODCAST',
    title: 'Maliyyə Söhbətləri',
    description: 'Maliyyə, audit və biznes dünyasının nəbzini tutan eksklüziv müsahibələr. Hər həftə yeni epizodlarla biliklərinizi yeniləyin.',
    buttonText: 'Hamısına Bax'
  },
  episodes: []
};

const existingBlogIds = new Set((blog.posts || []).map((p) => p.id));
const existingEpisodeIds = new Set((podcast.episodes || []).map((e) => e.id));

blog.posts = [...demoBlogs.filter((p) => !existingBlogIds.has(p.id)), ...(blog.posts || [])];
podcast.episodes = [...demoEpisodes.filter((e) => !existingEpisodeIds.has(e.id)), ...(podcast.episodes || [])];

const next = { ...sitemap, blog, podcast };

const put = await fetch(API + '/api/sitemap', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sitemap: next }),
});

if (!put.ok) {
  throw new Error('PUT failed: ' + put.status + ' ' + (await put.text()));
}

console.log('Demo data inserted');
console.log('Blog count:', blog.posts.length);
console.log('Podcast count:', podcast.episodes.length);
