import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, GraduationCap, Award, AlertTriangle, Download, Brain } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { useAuth } from '../../contexts/AuthContext';
import { getResumes, getResumeAnalysis, getJobRequirements, shortlistCandidate, checkIfAlreadyShortlisted } from '../../lib/supabase';
import { logEvent, analyzeResume, getResumeInsights } from '../../utils/api';
import { Resume, ResumeAnalysis, JobRequirement } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const ResumeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobRequirements, setJobRequirements] = useState<JobRequirement[]>([]);
  const [isAlreadyShortlisted, setIsAlreadyShortlisted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch resume details
        const { data: resumesData } = await getResumes(user.id);
        const foundResume = resumesData?.find(r => r.id === id) || null;
        
        if (!foundResume) {
          navigate('/resumes');
          return;
        }
        
        setResume(foundResume);
        
        // Log resume view event
        await logEvent({
          action: 'resume_view',
          resumeId: foundResume.id,
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
        
        // If resume is analyzed, fetch analysis data
        if (foundResume.analyzed && foundResume.analysis_id) {
          const { data: analysisData } = await getResumeAnalysis(foundResume.id);
          setAnalysis(analysisData || null);
        }
        
        // Fetch AI insights
        try {
          const insights = await getResumeInsights(foundResume.id);
          setAiInsights(insights);
        } catch (error) {
          console.log('AI insights not available:', error);
        }
        
        // Fetch job requirements for shortlisting
        const { data: jobsData } = await getJobRequirements(user.id);
        setJobRequirements(jobsData || []);
      } catch (error) {
        console.error('Error fetching resume details:', error);
        showToast('Failed to load resume details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, id, navigate]);

  // Check if already shortlisted when job selection changes
  useEffect(() => {
    const checkShortlistStatus = async () => {
      if (!user || !resume || !selectedJobId) {
        setIsAlreadyShortlisted(false);
        return;
      }

      try {
        const { exists } = await checkIfAlreadyShortlisted(resume.id, selectedJobId);
        setIsAlreadyShortlisted(exists);
      } catch (error) {
        console.error('Error checking shortlist status:', error);
      }
    };

    checkShortlistStatus();
  }, [selectedJobId, resume]);

  const handleShortlist = async () => {
    if (!user || !resume || !selectedJobId) {
      showToast('Please select a job requirement', 'warning');
      return;
    }
    
    setIsShortlisting(true);
    
    try {
      const matchScore = analysis?.match_score || aiInsights?.score || 0;
      
      const { data, error } = await shortlistCandidate({
        resume_id: resume.id,
        job_requirement_id: selectedJobId,
        match_score: matchScore,
        notes: '',
        user_id: user.id,
      });
      
      if (error) throw error;
      
      // Log shortlist event
      await logEvent({
        action: 'candidate_shortlist',
        resumeId: resume.id,
        jobId: selectedJobId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        metadata: {
          matchScore: matchScore
        }
      });
      
      showToast('Candidate has been shortlisted successfully', 'success');
      setIsAlreadyShortlisted(true);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to shortlist candidate',
        'error'
      );
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!user || !resume || !selectedJobId) {
      showToast('Please select a job requirement for analysis', 'warning');
      return;
    }

    const selectedJob = jobRequirements.find(job => job.id === selectedJobId);
    if (!selectedJob) {
      showToast('Selected job requirement not found', 'error');
      return;
    }

    setIsAnalyzing(true);

    try {
      // For demo purposes, we'll use placeholder resume text
      // In a real implementation, you'd extract text from the uploaded file
      const resumeText = `Resume for ${resume.name}`;
      const jobText = `${selectedJob.title}\n${selectedJob.description}\nRequired skills: ${selectedJob.skills.join(', ')}`;

      const analysisResult = await analyzeResume(resumeText, jobText);
      setAiInsights(analysisResult);

      // Log AI analysis event
      await logEvent({
        action: 'ai_analysis',
        resumeId: resume.id,
        jobId: selectedJobId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        metadata: {
          score: analysisResult.score,
          skillsMatch: analysisResult.skillsMatch,
          experienceMatch: analysisResult.experienceMatch
        }
      });

      showToast('AI analysis completed successfully', 'success');
    } catch (error) {
      console.error('AI analysis error:', error);
      showToast('Failed to perform AI analysis', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-8">Loading resume details...</div>
      </MainLayout>
    );
  }

  if (!resume) {
    return (
      <MainLayout>
        <div className="text-center py-8">Resume not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/resumes')}
            icon={<ArrowLeft className="h-4 w-4 mr-1" />}
          >
            Back to Resumes
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Resume Details */}
          <div className="lg:w-1/3">
            <Card>
              <CardHeader>
                <h1 className="text-xl font-bold text-gray-900">{resume.name}</h1>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">
                      {resume.file_type.toUpperCase()}
                    </Badge>
                    {resume.analyzed ? (
                      <Badge variant="success" className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        Analyzed
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending Analysis</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Uploaded on {new Date(resume.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    fullWidth
                    icon={<Download className="h-4 w-4 mr-1" />}
                  >
                    Download Resume
                  </Button>
                </div>
              
              </CardContent>
              
              {/* AI Analysis & Shortlist Section */}
              <CardFooter className="bg-gray-50 border-t border-gray-200">
                <div className="w-full space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">AI Analysis & Shortlisting</h3>
                  
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    <option value="">Select a job requirement</option>
                    {jobRequirements.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={isAnalyzing}
                      disabled={!selectedJobId || isAnalyzing}
                      onClick={handleAIAnalysis}
                      icon={<Brain className="h-4 w-4 mr-1" />}
                    >
                      AI Analysis
                    </Button>
                    
                    {isAlreadyShortlisted ? (
                      <Alert variant="info" className="text-xs">
                        Already shortlisted
                      </Alert>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isShortlisting}
                        disabled={!selectedJobId || isShortlisting || isAlreadyShortlisted}
                        onClick={handleShortlist}
                      >
                        Shortlist
                      </Button>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Analysis Results */}
          <div className="lg:w-2/3">
            {/* AI Insights */}
            {aiInsights && (
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Brain className="h-5 w-5 text-indigo-600 mr-2" />
                    AI Analysis Results
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{aiInsights.score}%</div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{aiInsights.skillsMatch}%</div>
                      <div className="text-sm text-gray-500">Skills Match</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{aiInsights.experienceMatch}%</div>
                      <div className="text-sm text-gray-500">Experience Match</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-green-700 mb-2">Strengths</h3>
                      <ul className="space-y-1">
                        {aiInsights.strengths?.map((strength: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-red-700 mb-2">Areas for Improvement</h3>
                      <ul className="space-y-1">
                        {aiInsights.weaknesses?.map((weakness: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-red-500 mr-2">⚠</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-blue-700 mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {aiInsights.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-blue-500 mr-2">💡</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!resume.analyzed ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Resume Analysis Pending</h2>
                  <p className="text-gray-500 mb-6">
                    This resume is currently being processed by our AI. The analysis will be available soon.
                  </p>
                  <Alert variant="info">
                    Analysis typically takes 1-2 minutes to complete. Refresh the page to check for updates.
                  </Alert>
                </CardContent>
              </Card>
            ) : analysis ? (
              <div className="space-y-6">
                {/* Candidate Information */}
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-medium text-gray-900">Candidate Information</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">{analysis.candidate_name}</span>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills.map((skill, index) => (
                            <Badge key={index} variant="primary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Experience & Education */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Experience */}
                  <Card>
                    <CardHeader className="flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Experience</h2>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.experience.map((exp, index) => (
                          <li key={index} className="text-sm">
                            <p>{exp}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Education */}
                  <Card>
                    <CardHeader className="flex items-center">
                      <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                      <h2 className="text-lg font-medium text-gray-900">Education</h2>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysis.education.map((edu, index) => (
                          <li key={index} className="text-sm">
                            <p>{edu}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-medium text-green-700">Strengths</h2>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Weaknesses */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-medium text-red-700">Areas for Improvement</h2>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-red-500 mr-2">⚠</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Match Score */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Overall Match Score</h3>
                        <p className="text-sm text-gray-500">
                          {analysis.match_score >= 80 
                            ? 'Excellent match for most positions' 
                            : analysis.match_score >= 60
                            ? 'Good match for relevant positions'
                            : 'May need additional skills for most positions'}
                        </p>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-indigo-700">
                          {analysis.match_score}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Analysis Error</h2>
                  <p className="text-gray-500">
                    There was an error retrieving the analysis for this resume.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeDetailPage;