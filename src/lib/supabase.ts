import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function signInAsGuest() {
  // Generate a random email and password for guest access
  const randomId = Math.random().toString(36).substring(2, 15);
  const email = `guest-${randomId}@example.com`;
  const password = `Guest${randomId}!`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        is_guest: true
      }
    }
  });
  
  if (!error) {
    // Auto sign in the guest user
    return await signIn(email, password);
  }
  
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function uploadResume(file: File, userId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `resumes/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file);
    
  if (error) {
    return { data: null, error };
  }
  
  // Add record to the resumes table
  const { data: resumeData, error: resumeError } = await supabase
    .from('resumes')
    .insert({
      name: file.name,
      file_path: filePath,
      file_type: fileExt,
      user_id: userId,
      analyzed: false
    })
    .select()
    .single();
    
  return { data: resumeData, error: resumeError };
}

export async function getResumes(userId: string) {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false });
    
  return { data, error };
}

export async function getResumeAnalysis(resumeId: string) {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('resume_id', resumeId)
    .single();
    
  return { data, error };
}

export async function saveJobRequirement(jobRequirement: Omit<JobRequirement, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('job_requirements')
    .insert(jobRequirement)
    .select()
    .single();
    
  return { data, error };
}

export async function getJobRequirements(userId: string) {
  const { data, error } = await supabase
    .from('job_requirements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  return { data, error };
}

export async function getShortlistedCandidates(userId: string, jobRequirementId?: string) {
  let query = supabase
    .from('shortlisted_candidates')
    .select(`
      *,
      resumes(id, name),
      job_requirements(id, title)
    `)
    .eq('user_id', userId);
    
  if (jobRequirementId) {
    query = query.eq('job_requirement_id', jobRequirementId);
  }
  
  const { data, error } = await query.order('shortlisted_at', { ascending: false });
  
  return { data, error };
}

export async function shortlistCandidate(candidateData: Omit<ShortlistedCandidate, 'id' | 'shortlisted_at'>) {
  const { data, error } = await supabase
    .from('shortlisted_candidates')
    .insert(candidateData)
    .select()
    .single();
    
  return { data, error };
}

export async function removeFromShortlist(candidateId: string) {
  const { error } = await supabase
    .from('shortlisted_candidates')
    .delete()
    .eq('id', candidateId);
    
  return { error };
}