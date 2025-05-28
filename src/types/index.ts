// Type definitions for the application

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in?: string;
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
}

export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'uploaded_at' | 'match_score';

export interface FilterOptions {
  search: string;
  sortBy: SortField;
  sortDirection: SortDirection;
  matchScoreMin?: number;
  matchScoreMax?: number;
  skills?: string[];
}