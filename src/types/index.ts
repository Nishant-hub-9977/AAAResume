// Type definitions for the application

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in?: string;
  app_metadata?: {
    provider?: string;
  };
}

export interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  user_id: string;
  analyzed: boolean;
  analysis_id?: string;
}

export interface JobRequirement {
  id: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  education: string;
  created_at: string;
  user_id: string;
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  candidate_name: string;
  skills: string[];
  experience: string[];
  education: string[];
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  analysis_date: string;
  job_requirement_id?: string;
}

export interface ShortlistedCandidate {
  id: string;
  resume_id: string;
  job_requirement_id: string;
  match_score: number;
  notes: string;
  shortlisted_at: string;
  user_id: string;
  resumes?: Resume;
  job_requirements?: JobRequirement;
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'uploaded_at' | 'match_score';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface FilterOptions {
  search: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  matchScoreMin?: number;
  matchScoreMax?: number;
  skills?: string[];
}

// Admin Dashboard Types
export interface AdminDashboardMetrics {
  overview: {
    totalEvents: number;
    totalUsers: number;
    activeUsers: number;
    systemHealth: 'healthy' | 'degraded' | 'unhealthy';
  };
  eventBreakdown: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    action: string;
    timestamp: string;
    userId: string;
    metadata?: Record<string, any>;
  }>;
  dailyActivity: Array<{
    date: string;
    count: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
  }>;
  timestamp: string;
}

export interface SystemHealth {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    bigquery: ServiceHealth;
    vertexai: ServiceHealth;
    storage: ServiceHealth;
    server: ServiceHealth;
  };
  timestamp: string;
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  message?: string;
  uptime?: number;
  memory?: NodeJS.MemoryUsage;
  timestamp?: string;
}