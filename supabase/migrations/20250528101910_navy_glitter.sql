/*
  # Add RLS policies for anonymous users

  1. Security
    - Add RLS policies to handle anonymous users
    - Restrict certain operations for anonymous users
*/

-- Create policies to handle anonymous users
CREATE POLICY "Anonymous users can only read their own data"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id AND
  (
    -- Allow both regular and anonymous users to read their own data
    (auth.jwt() ->> 'provider')::text != 'anonymous' OR
    (auth.jwt() ->> 'provider')::text = 'anonymous'
  )
);

CREATE POLICY "Anonymous users cannot update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id AND
  (auth.jwt() ->> 'provider')::text != 'anonymous'
);

CREATE POLICY "Anonymous users can only read their own resumes"
ON public.resumes
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND
  (
    (auth.jwt() ->> 'provider')::text != 'anonymous' OR
    (auth.jwt() ->> 'provider')::text = 'anonymous'
  )
);

CREATE POLICY "Anonymous users cannot create resumes"
ON public.resumes
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  (auth.jwt() ->> 'provider')::text != 'anonymous'
);

CREATE POLICY "Anonymous users cannot update resumes"
ON public.resumes
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() AND
  (auth.jwt() ->> 'provider')::text != 'anonymous'
);

CREATE POLICY "Anonymous users cannot delete resumes"
ON public.resumes
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() AND
  (auth.jwt() ->> 'provider')::text != 'anonymous'
);

-- Similar policies for job_requirements table
CREATE POLICY "Anonymous users can only read job requirements"
ON public.job_requirements
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND
  (
    (auth.jwt() ->> 'provider')::text != 'anonymous' OR
    (auth.jwt() ->> 'provider')::text = 'anonymous'
  )
);

CREATE POLICY "Anonymous users cannot create job requirements"
ON public.job_requirements
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  (auth.jwt() ->> 'provider')::text != 'anonymous'
);

-- Similar policies for shortlisted_candidates table
CREATE POLICY "Anonymous users can only read shortlisted candidates"
ON public.shortlisted_candidates
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() AND
  (
    (auth.jwt() ->> 'provider')::text != 'anonymous' OR
    (auth.jwt() ->> 'provider')::text = 'anonymous'
  )
);

CREATE POLICY "Anonymous users cannot create shortlisted candidates"
ON public.shortlisted_candidates
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  (auth.jwt() ->> 'provider')::text != 'anonymous'
);