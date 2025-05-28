import { createClient } from '@supabase/supabase-js';
import winston from 'winston';
import sgMail from '@sendgrid/mail';

// Initialize Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Initialize SendGrid
if (import.meta.env.VITE_SENDGRID_API_KEY) {
  sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendWelcomeEmail(email: string) {
  if (!import.meta.env.VITE_SENDGRID_API_KEY) {
    logger.warn('SendGrid API key not configured, skipping welcome email');
    return;
  }

  try {
    await sgMail.send({
      to: email,
      from: import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'noreply@resumeai.demo.com',
      subject: 'Welcome to ResumeAI',
      text: 'Thank you for signing up for ResumeAI. We\'re excited to help you streamline your hiring process.',
      html: '<h1>Welcome to ResumeAI</h1><p>Thank you for signing up. We\'re excited to help you streamline your hiring process.</p>',
    });
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error('Error sending welcome email:', error);
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (!error && data.user) {
      await sendWelcomeEmail(email);
    }
    
    return { data, error };
  } catch (error) {
    logger.error('Error during sign up:', error);
    return { data: null, error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  } catch (error) {
    logger.error('Error during sign in:', error);
    return { data: null, error };
  }
}

export async function signInAsGuest() {
  try {
    // Generate a random email and password for guest access
    const randomId = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const email = `guest-${randomId}-${timestamp}@guest.demo.com`;
    const password = `Guest${randomId}${timestamp}!`;
    
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
  } catch (error) {
    logger.error('Error during guest sign in:', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    logger.error('Error during sign out:', error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user;
  } catch (error) {
    logger.error('Error getting current user:', error);
    return null;
  }
}

export async function uploadResume(file: File, userId: string) {
  try {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and Word documents are allowed.');
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `resumes/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file);
      
    if (error) {
      throw error;
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
  } catch (error) {
    logger.error('Error uploading resume:', error);
    return { data: null, error };
  }
}

export async function getResumes(userId: string) {
  try {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });
      
    return { data, error };
  } catch (error) {
    logger.error('Error fetching resumes:', error);
    return { data: null, error };
  }
}

export async function getResumeAnalysis(resumeId: string) {
  try {
    const { data, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('resume_id', resumeId)
      .single();
      
    return { data, error };
  } catch (error) {
    logger.error('Error fetching resume analysis:', error);
    return { data: null, error };
  }
}

export async function saveJobRequirement(jobRequirement: Omit<JobRequirement, 'id' | 'created_at'>) {
  try {
    const { data, error } = await supabase
      .from('job_requirements')
      .insert(jobRequirement)
      .select()
      .single();
      
    return { data, error };
  } catch (error) {
    logger.error('Error saving job requirement:', error);
    return { data: null, error };
  }
}

export async function getJobRequirements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('job_requirements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    return { data, error };
  } catch (error) {
    logger.error('Error fetching job requirements:', error);
    return { data: null, error };
  }
}

export async function getShortlistedCandidates(userId: string, jobRequirementId?: string) {
  try {
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
  } catch (error) {
    logger.error('Error fetching shortlisted candidates:', error);
    return { data: null, error };
  }
}

export async function shortlistCandidate(candidateData: Omit<ShortlistedCandidate, 'id' | 'shortlisted_at'>) {
  try {
    const { data, error } = await supabase
      .from('shortlisted_candidates')
      .insert(candidateData)
      .select()
      .single();
      
    return { data, error };
  } catch (error) {
    logger.error('Error shortlisting candidate:', error);
    return { data: null, error };
  }
}

export async function removeFromShortlist(candidateId: string) {
  try {
    const { error } = await supabase
      .from('shortlisted_candidates')
      .delete()
      .eq('id', candidateId);
      
    return { error };
  } catch (error) {
    logger.error('Error removing candidate from shortlist:', error);
    return { error };
  }
}