
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isPreview?: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  duration: string;
  level: 'Başlanğıc' | 'Orta' | 'İrəli';
  thumbnailUrl: string;
  rating: number;
  description: string;
  longDescription: string;
  learningOutcomes: string[];
  requirements: string[];
  studentCount: number;
  modules: CourseModule[];
  perks: Array<string | CoursePerk>;
}

export interface CoursePerk {
  text: string;
  iconName: 'CheckCircle' | 'Shield' | 'Users' | 'BookOpen' | 'Star' | 'Clock';
}

export type BlockType = 'paragraph' | 'heading' | 'image' | 'quote' | 'list';

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string; // HTML for text types, URL for images, or JSON string for lists
  imageUrl?: string;
  caption?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  imageUrl: string;
  category: string;
  blocks: ContentBlock[]; 
  status: 'draft' | 'published';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  host: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: 'ShieldCheck' | 'Calculator' | 'Users' | 'FileText' | 'TrendingUp' | 'Briefcase';
  imageUrl: string;
}
