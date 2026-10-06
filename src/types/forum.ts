export type ForumTopicStatus = 'OPEN' | 'CLOSED' | 'PINNED';

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  topics_count?: number;
  created_at: string;
}

export interface ForumTopic {
  id: string;
  category_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: 'TEACHER' | 'STUDENT' | 'PARENT' | 'SCHOOL_ADMIN';
  title: string;
  content: string;
  tags?: string[];
  views_count: number;
  likes_count: number;
  comments_count: number;
  status: ForumTopicStatus;
  created_at: string;
  updated_at?: string;
}

export interface ForumComment {
  id: string;
  topic_id: string;
  parent_id?: string | null; //Dành cho các câu trả lời lồng nhau
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role: 'TEACHER' | 'STUDENT' | 'PARENT' | 'SCHOOL_ADMIN';
  content: string;
  likes_count: number;
  is_accepted_answer?: boolean;
  created_at: string;
  updated_at?: string;
}
