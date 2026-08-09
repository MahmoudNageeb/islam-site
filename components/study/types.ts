'use client';

// ═══════════ أنواع بيانات نظام المذاكرة الذكي ═══════════

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  day: string;
  text: string;
  priority: Priority;
  done: number;
  link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_index: number;
  project_id: number | null;
  start_time: string | null;
  end_time: string | null;
  date: string | null;
  recurring: string;
  status: string;
  vacation: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: number;
  name: string;
  url: string;
  description: string | null;
  tags: string | null;
  created_at: string;
}

export interface SessionRow {
  id: number;
  type: string;
  duration_seconds: number;
  planned_seconds: number;
  task_id: number | null;
  date: string;
  created_at: string;
}

export interface Rewards {
  id: number;
  badges: string | null;
  points: number;
  level: number;
  streak_days: number;
  last_study_date: string | null;
  updated_at: string;
}

export interface Settings {
  work_time: string;
  break_time: string;
  long_break_time: string;
  theme: string;
  notifications: string;
}

export const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'عالية',
  medium: 'متوسطة',
  low: 'منخفضة',
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#ff5252',
  medium: '#ffd740',
  low: '#00e5ff',
};

export const PRIORITY_ICON: Record<Priority, string> = {
  high: '🔴',
  medium: '🟡',
  low: '🔵',
};
