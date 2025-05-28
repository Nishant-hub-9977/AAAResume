/*
  # Initial Schema Setup for ResumeAI Application

  1. New Tables
    - `resumes`: Stores information about uploaded resumes
    - `resume_analyses`: Stores AI analysis results for resumes
    - `job_requirements`: Stores job requirements defined by users
    - `shortlisted_candidates`: Stores shortlisted candidates for jobs
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL,
  analyzed boolean DEFAULT false,
  analysis_id uuid
);

-- Create resume_analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  candidate_name text,
  skills text[] DEFAULT '{}',
  experience text[] DEFAULT '{}',
  education text[] DEFAULT '{}',
  match_score integer DEFAULT 0,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  analysis_date timestamptz DEFAULT now(),
  job_requirement_id uuid
);

-- Create job_requirements table
CREATE TABLE IF NOT EXISTS job_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  skills text[] NOT NULL,
  experience text NOT NULL,
  education text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL
);

-- Create shortlisted_candidates table
CREATE TABLE IF NOT EXISTS shortlisted_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  job_requirement_id uuid REFERENCES job_requirements(id) ON DELETE CASCADE,
  match_score integer DEFAULT 0,
  notes text,
  shortlisted_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlisted_candidates ENABLE ROW LEVEL SECURITY;

-- Create policies for resumes
CREATE POLICY "Users can create their own resumes"
  ON resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own resumes"
  ON resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for resume_analyses
CREATE POLICY "Users can view analyses of their own resumes"
  ON resume_analyses
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM resumes 
    WHERE resumes.id = resume_analyses.resume_id 
    AND resumes.user_id = auth.uid()
  ));

-- Create policies for job_requirements
CREATE POLICY "Users can create their own job requirements"
  ON job_requirements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own job requirements"
  ON job_requirements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own job requirements"
  ON job_requirements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job requirements"
  ON job_requirements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for shortlisted_candidates
CREATE POLICY "Users can create their own shortlisted candidates"
  ON shortlisted_candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own shortlisted candidates"
  ON shortlisted_candidates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shortlisted candidates"
  ON shortlisted_candidates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shortlisted candidates"
  ON shortlisted_candidates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);