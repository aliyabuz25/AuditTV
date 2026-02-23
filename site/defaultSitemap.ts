import {
  BLOG_POSTS,
  CLIENTS,
  COURSES,
  FAQS,
  FINANCIAL_FACTS,
  NAV_LINKS,
  PODCAST_EPISODES,
  SERVICES,
  TEAM,
  TESTIMONIALS,
  TOPICS,
} from '../constants';

export type Sitemap = {
  navLinks: typeof NAV_LINKS;
  topics: typeof TOPICS;
  financialFacts: typeof FINANCIAL_FACTS;
  testimonials: typeof TESTIMONIALS;
  services: typeof SERVICES;
  clients: typeof CLIENTS;
  home: {
    hero: {
      title: string;
      sub: string;
      btn1Text: string;
      btn1Link: string;
      btn2Text: string;
      btn2Link: string;
    };
    benefit: {
      header: string;
      desc: string;
      items: Array<{ id: number; text: string }>;
      btnText: string;
      fileName: string;
      fileUrl: string;
    };
    podcastSection: {
      badge: string;
      title: string;
      sub: string;
      btnText: string;
    };
    headers: {
      targetsTitle: string;
      factsTitle: string;
      factsSub: string;
      blogTitle: string;
      blogSub: string;
      blogCardTitle: string;
      blogCardSub: string;
      faqTitle: string;
      faqSub: string;
      newsTitle: string;
      newsSub: string;
      newsBtnText: string;
    };
    targets: Array<{ title: string; desc: string; icon: string }>;
    facts: Array<{ text: string; icon: string }>;
  };
  about: {
    hero: {
      badge: string;
      title: string;
      spanTitle: string;
      sub: string;
      stat1Year: string;
      stat1Label: string;
      stat2Val: string;
      stat2Label: string;
      stat3Val: string;
      stat3Label: string;
      satisfactionRate: string;
      satisfactionLabel: string;
    };
    narrative: {
      title: string;
      quote: string;
      para1: string;
      para2: string;
    };
    values: Array<{ icon: string; title: string; desc: string }>;
    whyUs: {
      title: string;
      spanTitle: string;
      items: Array<{ icon: string; title: string; desc: string; number: string }>;
    };
    vision: {
      badge: string;
      title: string;
      spanTitle: string;
      sub: string;
      goals: string[];
    };
    team: typeof TEAM;
  };
  blog: {
    pageHeader: {
      badge: string;
      title: string;
      sub: string;
    };
    posts: typeof BLOG_POSTS;
  };
  education: {
    pageHeader: {
      badge: string;
      title: string;
      sub: string;
    };
    courses: typeof COURSES;
  };
  podcast: {
    pageHeader: {
      badge: string;
      title: string;
      description: string;
      buttonText: string;
    };
    episodes: typeof PODCAST_EPISODES;
  };
  faq: {
    faqs: typeof FAQS;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    responseTime: string;
  };
  settings: {
    seo: {
      title: string;
      description: string;
      keywords: string;
      canonicalUrl: string;
    };
    smtp: {
      host: string;
      port: number;
      username: string;
      password: string;
      secure: boolean;
      fromEmail: string;
      fromName: string;
    };
    branding: {
      logoUrl: string;
      siteName: string;
    };
    footer: {
      aboutText: string;
      platformTitle: string;
      resourcesTitle: string;
      contactTitle: string;
      address: string;
      phone: string;
      email: string;
      platformLinks: Array<{ label: string; path: string }>;
      resourceLinks: Array<{ label: string; path: string }>;
      socialLinks: {
        linkedin: string;
        facebook: string;
        twitter: string;
        email: string;
      };
      copyrightText: string;
      privacyLabel: string;
      privacyUrl: string;
      termsLabel: string;
      termsUrl: string;
    };
  };
};

export const defaultSitemap: Sitemap = {
  navLinks: JSON.parse(JSON.stringify(NAV_LINKS)),
  topics: JSON.parse(JSON.stringify(TOPICS)),
  financialFacts: JSON.parse(JSON.stringify(FINANCIAL_FACTS)),
  testimonials: JSON.parse(JSON.stringify(TESTIMONIALS)),
  services: JSON.parse(JSON.stringify(SERVICES)),
  clients: JSON.parse(JSON.stringify(CLIENTS)),
  home: {
    hero: {
      title: 'İndi Öyrən, Dərhal Tətbiq Et',
      sub: 'Sahibkarlar və maliyyəçilər üçün peşəkar maarifləndirmə platforması. Pulsuz rəhbərlər və ekspert kursları ilə biznesinizi növbəti səviyyəyə daşıyın.',
      btn1Text: 'Podcastlara Bax',
      btn1Link: '/podcast',
      btn2Text: 'Bloglar',
      btn2Link: '/blog',
    },
    benefit: {
      header: 'Həftənin Faydası',
      desc: 'Bu həftənin xüsusi resursu: "2026 Vergi Təqvimi və Audit Checklist"',
      items: [
        { id: 1, text: 'Pulsuz PDF Rəhbər' },
        { id: 2, text: 'Excel Hesablama Modulu' },
      ],
      btnText: 'İndi Yüklə (Pulsuz)',
      fileName: '1771664047371-132229953.pdf',
      fileUrl: '/uploads/1771664047371-132229953.pdf',
    },
    podcastSection: {
      badge: 'audit.tv Podcast',
      title: 'Maliyyə Söhbətləri',
      sub: 'Hər həftə yeni epizodlarla biliklərinizi yeniləyin.',
      btnText: 'Hamısına Bax',
    },
    headers: {
      targetsTitle: 'Bu platforma kimlər üçündür?',
      factsTitle: 'Bilik Sandığı',
      factsSub: 'Sahibkarlar və maliyyəçilər üçün vacib məlumatlar',
      blogTitle: 'Ekspert Analizləri',
      blogSub: 'Günün ən vacib maliyyə və vergi mövzuları',
      blogCardTitle: 'Bütün məqalələrə keç',
      blogCardSub: '600-dən çox elmi və praktiki məqalə.',
      faqTitle: 'Tez-tez Verilən Suallar',
      faqSub: 'Sizi maraqlandıran suallara dərhal cavab tapın',
      newsTitle: 'Maliyyə Nəbzini Tutun',
      newsSub: 'Hər həftənin vergi yenilikləri və maliyyə analizləri birbaşa e-poçtunuza gəlsin.',
      newsBtnText: 'Abunə Ol',
    },
    targets: [
      { title: 'Sahibkarlar', desc: 'Biznesin maliyyə risklərini anlamaq və vergi optimallaşdırmasını öyrənmək üçün.', icon: 'Briefcase' },
      { title: 'Mühasiblər', desc: 'Peşəkar biliklərini yeniləmək və beynəlxalq standartları (MHBS) mənimsəmək üçün.', icon: 'Calculator' },
      { title: 'Maliyyəçilər', desc: 'Data analitikasını, büdcə planlamasını və hesabatlılıq sistemlərini təkmilləşdirmək üçün.', icon: 'PieChart' },
      { title: 'Tələbələr', desc: 'Karyera yolunda ilk addımlarını praktiki biliklərlə və real keyslərlə atmaq üçün.', icon: 'UserCheck' },
    ],
    facts: [{ text: 'Bilirsinizmi? 2024-cü ildə kiçik bizneslərdə vergi yoxlamalarının 40%-i sadə sənəd xətalarına görə baş verib.', icon: 'AlertCircle' }],
  },
  about: {
    hero: {
      badge: 'Peşəkarlıq & Etimad',
      title: 'Maliyyənin',
      spanTitle: 'Rəqəmsal Səsi',
      sub: 'Biz sadəcə audit şirkəti deyilik. audit.tv — Azərbaycanın maliyyə ekosistemini bilik, innovasiya və şəffaflıqla gücləndirən hibrid platformadır.',
      stat1Year: '2015',
      stat1Label: 'Yaranma ili',
      stat2Val: '100+',
      stat2Label: 'Audit Layihəsi',
      stat3Val: '15K+',
      stat3Label: 'Tələbə İcması',
      satisfactionRate: '98%',
      satisfactionLabel: 'Müştəri Məmnuniyyəti',
    },
    narrative: {
      title: 'Biz Kimik?',
      quote: '"Biliyin hər kəs üçün əlçatan olması biznesin davamlı inkişafının yeganə yoludur."',
      para1: 'Audit.tv-nin təməli 2015-ci ildə bir qrup beynəlxalq dərəcəli auditor və maliyyə eksperti tərəfindən qoyulmuşdur. Məqsədimiz yerli bazarın spesifikasını nəzərə alaraq, şirkətlərə qlobal standartlarda audit xidməti təqdim etmək idi.',
      para2: 'Lakin zamanla anladıq ki, bazarda yalnız yoxlama deyil, həm də maarifləndirmə ehtiyacı var. Beləliklə, biz audit fəaliyyətimizi media və tədrislə birləşdirərək Azərbaycanın ilk onlayn maliyyə akademiyasını yaratdıq.',
    },
    values: [
      { icon: 'ShieldCheck', title: 'Dürüstlük', desc: 'Bütün hesabatlarımızda qərəzsizlik və şəffaflıq prinsipinə sadiqik.' },
      { icon: 'Lightbulb', title: 'İnnovasiya', desc: 'Auditdə süni intellekt və data analitikasını tətbiq edirik.' },
      { icon: 'Globe', title: 'Beynəlxalq Baxış', desc: 'IFRS və ISA standartlarını yerli biznesə inteqrasiya edirik.' },
      { icon: 'Target', title: 'Nəticə', desc: 'Bizim üçün əsas hədəf müştərinin real qənaəti və inkişafıdır.' },
    ],
    whyUs: {
      title: 'NİYƏ',
      spanTitle: 'AUDİT TV?',
      items: [
        { icon: 'Cpu', title: 'İntellektual Metodologiya', desc: 'Biz auditi köhnə üsullarla deyil, 2026-cı ilin rəqəmsal alqoritmləri ilə həyata keçiririk.', number: '01' },
        { icon: 'Shield', title: 'Mütləq Şəffaflıq', desc: 'Hər bir hesabat real vaxt rejimində izlənilə bilən şəffaflıq standartlarına əsaslanır.', number: '02' },
        { icon: 'UserCheck', title: 'Ekspert Rəhbərliyi', desc: 'Platformamızda yalnız sahə üzrə real təcrübəyə malik peşəkarlar fəaliyyət göstərir.', number: '03' },
      ],
    },
    vision: {
      badge: 'Gələcəyə Baxış',
      title: 'Vizyon',
      spanTitle: '2030',
      sub: 'Bizim hədəfimiz 2030-cu ilə qədər Azərbaycanın maliyyə sektorunu rəqəmsallaşdıraraq, regionun ən innovativ audit mərkəzinə çevrilməkdir.',
      goals: [
        'Audit fəaliyyətinin 90% avtomatlaşdırılması',
        '100,000+ maliyyə mütəxəssisinin təlimatlandırılması',
        'Süni intellekt əsaslı daxili nəzarət modulları',
      ],
    },
    team: JSON.parse(JSON.stringify(TEAM)),
  },
  blog: {
    pageHeader: {
      badge: 'EKSPERT BLOQU',
      title: 'Faydalı Məqalələr və Analizlər',
      sub: 'Günün ən vacib maliyyə və vergi mövzuları haqqında peşəkar rəylər.',
    },
    posts: JSON.parse(JSON.stringify(BLOG_POSTS)),
  },
  education: {
    pageHeader: {
      badge: 'ONLİNE AKADEMİYA',
      title: 'Peşəkarınızı Bizimlə Artırın',
      sub: 'Yerli qanunvericilik və beynəlxalq standartlar əsasında hazırlanmış praktiki kurslar.',
    },
    courses: JSON.parse(JSON.stringify(COURSES)),
  },
  podcast: {
    pageHeader: {
      badge: 'AUDİT.TV PODCAST',
      title: 'Maliyyə Söhbətləri',
      description: 'Maliyyə, audit və biznes dünyasının nəbzini tutan eksklüziv müsahibələr. Hər həftə yeni epizodlarla biliklərinizi yeniləyin.',
      buttonText: 'Hamısına Bax',
    },
    episodes: JSON.parse(JSON.stringify(PODCAST_EPISODES)),
  },
  faq: { faqs: JSON.parse(JSON.stringify(FAQS)) },
  contact: {
    address: 'Bakı şəhəri, Nizami küçəsi 14',
    phone: '+994 50 123 45 67',
    email: 'info@audit.tv',
    responseTime: 'Biz adətən 1 saat ərzində müraciətlərə baxırıq.',
  },
  settings: {
    seo: {
      title: 'audit.tv - Bilik və Təcrübə Platforması',
      description: 'Maliyyə savadlılığı və peşəkar inkişaf üçün onlayn media və tədris platforması.',
      keywords: 'audit, vergi, maliyyə, podcast, tədris',
      canonicalUrl: 'https://audit.tv',
    },
    smtp: {
      host: '',
      port: 587,
      username: '',
      password: '',
      secure: false,
      fromEmail: 'no-reply@audit.tv',
      fromName: 'audit.tv',
    },
    branding: {
      logoUrl: '',
      siteName: 'audit.tv',
    },
    footer: {
      aboutText: 'Maliyyə savadlılığı və peşəkar inkişaf üçün onlayn media və tədris platforması.',
      platformTitle: 'Platforma',
      resourcesTitle: 'Resurslar',
      contactTitle: 'Əlaqə',
      address: 'Bakı şəhəri, Nizami küç. 14',
      phone: '+994 50 123 45 67',
      email: 'info@audit.tv',
      platformLinks: [
        { label: 'Haqqımızda', path: '/haqqimizda' },
        { label: 'Əlaqə', path: '/elaqe' },
      ],
      resourceLinks: [
        { label: 'Tədris Mərkəzi', path: '/tedris' },
        { label: 'Podcast', path: '/podcast' },
        { label: 'Blog', path: '/blog' },
      ],
      socialLinks: {
        linkedin: '#',
        facebook: '#',
        twitter: '#',
        email: 'mailto:info@audit.tv',
      },
      copyrightText: 'audit.tv. All rights reserved.',
      privacyLabel: 'Məxfilik Siyasəti',
      privacyUrl: '#',
      termsLabel: 'İstifadə Şərtləri',
      termsUrl: '#',
    },
  },
};
