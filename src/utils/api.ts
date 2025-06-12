const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface AnalyticsEvent {
  action: string;
  resumeId?: string;
  jobId?: string;
  userId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetrics {
  totalResumes: number;
  totalJobs: number;
  totalShortlisted: number;
  analysisStats: {
    analyzed: number;
    pending: number;
  };
  recentActivity: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
  topSkills: Array<{
    skill: string;
    count: number;
  }>;
  averageMatchScore: number;
}

export interface ResumeAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillsMatch: number;
  experienceMatch: number;
}

export const uploadResume = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  return await response.json();
};

export const analyzeResume = async (resumeText: string, jobText: string): Promise<ResumeAnalysisResult> => {
  const response = await fetch(`${API_BASE_URL}/ai/analyze-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume: resumeText, job: jobText }),
  });
  
  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }
  
  return await response.json();
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const response = await fetch(`${API_BASE_URL}/analytics/dashboard`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }
  
  return await response.json();
};

export const logEvent = async (data: AnalyticsEvent): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Failed to log analytics event:', error);
    // Don't throw error to avoid breaking user experience
  }
};

export const getResumeInsights = async (resumeId: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/ai/resume-insights/${resumeId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }
  
  return await response.json();
};

// Admin API functions
export const getAdminDashboardMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch admin metrics: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
};

export const getSystemHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/system/health`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch system health: ${response.statusText}`);
  }
  
  return await response.json();
};

export const getUserAnalytics = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/analytics`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user analytics: ${response.statusText}`);
  }
  
  return await response.json();
};

export const getStorageStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/storage/stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch storage stats: ${response.statusText}`);
  }
  
  return await response.json();
};