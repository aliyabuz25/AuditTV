
import { Course, BlogPost, TeamMember, PodcastEpisode, Client, Service } from './types';

export const NAV_LINKS = [
  { name: 'Ana Səhifə', path: '/' },
  { name: 'Haqqımızda', path: '/haqqimizda' },
  { name: 'Podcast', path: '/podcast' },
  { name: 'Tədris', path: '/tedris' },
  { name: 'Blog', path: '/blog' },
];

export const TOPICS = [
  { id: 'tax', name: 'Vergi', icon: 'Calculator', count: '45+ Dərs' },
  { id: 'audit', name: 'Audit', icon: 'ShieldCheck', count: '32+ Analiz' },
  { id: 'finance', name: 'Maliyyə', icon: 'TrendingUp', count: '28+ Resurs' },
  { id: 'hr', name: 'HR & Kadrlar', icon: 'Users', count: '15+ Rəhbər' },
  { id: 'tech', name: 'Texnologiya', icon: 'FileText', count: '12+ İnnovasiya' },
  { id: 'edu', name: 'Tədris', icon: 'Briefcase', count: '20+ Kurs' },
];

export const FINANCIAL_FACTS = [
  { id: 1, text: "Bilirsinizmi? 2024-cü ildə kiçik bizneslərdə vergi yoxlamalarının 40%-i sadə sənəd xətalarına görə baş verib.", icon: "AlertCircle" },
  { id: 2, text: "Audit hesabatı olan şirkətlər banklardan kredit alarkən 20% daha aşağı faiz dərəcəsi əldə edə bilirlər.", icon: "TrendingUp" },
  { id: 3, text: "Rəqəmsal mühasibatlığa keçid əməliyyat xərclərini orta hesabla 35% azaldır.", icon: "Cpu" }
];

export const TESTIMONIALS = [
  { id: 1, name: "Kamran Vəliyev", role: "Sahibkar", text: "Audit.tv-dən aldığım vergi rəhbəri sayəsində şirkətimin illik xərclərini 15% optimallaşdırdım.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" },
  { id: 2, name: "Günel Əzimova", role: "Baş Mühasib", text: "ACCA hazırlıq dərsləri o qədər praktiki idi ki, imtahanı birinci cəhddən keçdim.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" }
];

export const FAQS = [
  { q: "Audit xidməti mənə nə üçün lazımdır?", a: "Audit yalnız qanuni tələb deyil, həm də biznesinizin daxili zəif nöqtələrini görmək və riskləri önləmək üçün ən yaxşı vasitədir." },
  { q: "Kursları bitirdikdə sertifikat verilir?", a: "Bəli, hər bir kursun sonunda imtahandan keçən tələbələrə beynəlxalq standartlara uyğun daxili sertifikat təqdim olunur." },
  { q: "Vergi bəyannamələrini özüm doldura bilərəm?", a: "Bəli, bizim 'Praktiki Vergi' kursumuzla siz bütün bəyannamələri sərbəst doldurmağı öyrənəcəksiniz." }
];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: '1',
    title: 'Auditdə Süni İntellekt: Təhlükə yoxsa İmkan?',
    description: 'Rəqəmsal transformasiyanın audit peşəsinə təsiri barədə müzakirə.',
    duration: '35 dəq',
    date: '24 Noyabr 2025',
    host: 'İbadət Binyətov',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515378791036-0648a814c963?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: '2',
    title: 'Yeni Vergi Məcəlləsi: Nələri bilməliyik?',
    description: 'Son dəyişikliklərin sahibkarlar üçün yaratdığı imkanlar.',
    duration: '22 dəq',
    date: '20 Noyabr 2025',
    host: 'Emin Məmmədov',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: '3',
    title: 'Karyera Yolu: Auditor olmaq üçün ilk addımlar',
    description: 'Gənc mütəxəssislər üçün yol xəritəsi.',
    duration: '45 dəq',
    date: '15 Noyabr 2025',
    host: 'Aysel Əliyeva',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

const DUMMY_MODULES = [
  {
    id: 'm1',
    title: 'Giriş və Əsas Anlayışlar',
    lessons: [
      { id: 'l1', title: 'Kurs haqqında ümumi məlumat', duration: '05:20', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', isPreview: true },
      { id: 'l2', title: 'Əsas terminologiya və standartlar', duration: '12:45', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    ]
  },
  {
    id: 'm2',
    title: 'Praktiki Tətbiqlər',
    lessons: [
      { id: 'l3', title: 'Sənədləşmə ilə iş: Real Keyslər', duration: '22:10', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 'l4', title: 'Hesabatların tərtibi', duration: '18:30', videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
    ]
  }
];

export const COURSES: Course[] = [
  {
    id: '101',
    title: 'Praktiki Mühasibatlıq: Sıfırdan Peşəkara',
    instructor: 'İbadət Binyətov',
    price: 150.00,
    duration: '32 saat',
    level: 'Başlanğıc',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    rating: 4.9,
    description: 'Mühasibat uçotunun bütün incəliklərini real keyslər üzərindən öyrənin.',
    longDescription: 'Bu kurs mühasibat sahəsində karyera qurmaq istəyənlər üçün nəzərdə tutulub. Biz nəzəriyyədən daha çox praktikaya üstünlük veririk. Kursun sonunda siz sərbəst şəkildə müəssisənin uçotunu qura biləcəksiniz.',
    learningOutcomes: [
      'Hesablar planının sərbəst istifadəsi',
      'Vergi bəyannamələrinin hazırlanması',
      '1C proqramında işləmək bacarığı',
      'İllik maliyyə hesabatlarının tərtibi'
    ],
    requirements: [
      'İlkin kompüter bilikləri',
      'Riyazi təfəkkür',
      'Öyrənmək istəyi'
    ],
    studentCount: 1240,
    modules: DUMMY_MODULES,
    // Fix missing 'perks' property
    perks: ['Ömürlük giriş', 'Rəsmi Sertifikat', 'Mentor Dəstəyi']
  },
  {
    id: '102',
    title: 'Audit və Daxili Nəzarət Sistemi',
    instructor: 'Aysel Əliyeva',
    price: 250.00,
    duration: '24 saat',
    level: 'Orta',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    rating: 4.8,
    description: 'Biznes proseslərin yoxlanılması və risklərin idarə olunması.',
    longDescription: 'Şirkətin daxili nəzarət mexanizmlərinin necə işlədiyini və auditin əsas prinsiplərini dərindən mənimsəyin. Beynəlxalq audit standartları (ISA) əsasında hazırlanmış proqramdır.',
    learningOutcomes: [
      'Audit risklərinin qiymətləndirilməsi',
      'Daxili nəzarət testlərinin keçirilməsi',
      'Audit hesabatının hazırlanması'
    ],
    requirements: [
      'İlkin mühasibatlıq biliyi',
      'Maliyyə hesabatlarını oxuma bacarığı'
    ],
    studentCount: 850,
    modules: DUMMY_MODULES,
    // Fix missing 'perks' property
    perks: ['ISA Standartları', 'Real Case Study-lər', 'Sertifikat']
  },
  {
    id: '103',
    title: 'Excel for Finance: Professional Masterclass',
    instructor: 'Rəşad Qasımov',
    price: 99.00,
    duration: '18 saat',
    level: 'Orta',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800',
    rating: 5.0,
    description: 'Maliyyə analizi və modelləşdirmə üçün Excel-in gücündən istifadə edin.',
    longDescription: 'Yalnız cədvəllər yox, həm də mürəkkəb maliyyə modelləri qurmağı öyrənin. Pivot, VLOOKUP və mürəkkəb formullarla işləməyi avtomatlaşdırın.',
    learningOutcomes: [
      'Dinamik dashboard-ların qurulması',
      'Maliyyə proqnozlaşdırma modelləri',
      'Böyük data ilə sürətli işləmə'
    ],
    requirements: [
      'Bazis Excel biliyi'
    ],
    studentCount: 2100,
    modules: DUMMY_MODULES,
    // Fix missing 'perks' property
    perks: ['Excel Şablonları', 'Video Dərslər', 'Mentor Dəstəyi']
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '2026-cı il üçün Vergi İslahatları: Sahibkarlar Nələri Bilməlidir?',
    excerpt: 'Yeni vergi paketində nəzərdə tutulan güzəştlər və bəyannamə formalarında dəyişikliklər haqqında geniş təhlil.',
    date: '23 Noyabr 2025',
    author: 'İbadət Binyətov',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
    category: 'Vergi',
    // Fix missing 'blocks' and 'status' properties
    status: 'published',
    blocks: []
  },
  {
    id: '2',
    title: 'MHBS-ə Keçid: Maliyyə Şəffaflığında Yeni Mərhələ',
    excerpt: 'Yerli şirkətlərin beynəlxalq maliyyə hesabatlılığı standartlarına keçidinin texniki mərhələləri.',
    date: '21 Noyabr 2025',
    author: 'Aysel Əliyeva',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    category: 'Audit',
    // Fix missing 'blocks' and 'status' properties
    status: 'published',
    blocks: []
  },
  {
    id: '3',
    title: 'Kredit Risklərinin İdarə Edilməsi: Müasir Yanaşmalar',
    excerpt: 'Bank sektorunda və özəl müəssisələrdə borc öhdəliklərinin analizi.',
    date: '18 Noyabr 2025',
    author: 'İbadət Binyətov',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    category: 'Maliyyə',
    // Fix missing 'blocks' and 'status' properties
    status: 'published',
    blocks: []
  },
  {
    id: '4',
    title: 'Rəqəmsal Kadr Uçotu: E-Sosial Portalında Yeniliklər',
    excerpt: 'Əmək müqavilələrinin elektron qeydiyyatı zamanı ən çox yol verilən səhvlər.',
    date: '15 Noyabr 2025',
    author: 'Leyla Əhmədova',
    imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800',
    category: 'HR',
    // Fix missing 'blocks' and 'status' properties
    status: 'published',
    blocks: []
  }
];

export const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'İbadət Binyətov',
    role: 'Təsisçi & Baş Auditor',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bio: '15 illik audit və maliyyə təcrübəsi ilə platformanın baş eksperti.'
  }
];

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Maliyyə Auditi',
    description: 'Şirkətinizin maliyyə hesabatlarının beynəlxalq standartlara uyğunluğunun yoxlanılması.',
    iconName: 'ShieldCheck',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800'
  }
];

export const CLIENTS: Client[] = [{ id: '1', name: 'Azfin MMC', logoUrl: '' }];
