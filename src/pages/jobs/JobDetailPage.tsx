import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, BookOpen, GraduationCap, Users } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getJobRequirements, getShortlistedCandidates } from '../../lib/supabase';
import { JobRequirement, ShortlistedCandidate } from '../../types';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobRequirement | null>(null);
  const [shortlisted, setShortlisted] = useState<ShortlistedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch job details
        const { data: jobsData } = await getJobRequirements(user.id);
        const foundJob = jobsData?.find(j => j.id === id) || null;
        
        if (!foundJob) {
          navigate('/jobs');
          return;
        }
        
        setJob(foundJob);
        
        // Fetch shortlisted candidates for this job
        const { data: shortlistedData } = await getShortlistedCandidates(user.id, id);
        setShortlisted(shortlistedData || []);
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, id, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-center py-8">Loading job details...</div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-8">Job requirement not found</div>
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
            onClick={() => navigate('/jobs')}
            icon={<ArrowLeft className="h-4 w-4 mr-1" />}
          >
            Back to Job Requirements
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Job Details */}
          <div className="lg:w-2/3">
            <Card>
              <CardHeader className="flex items-start border-b border-gray-200">
                <div className="h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center mr-4">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Created on {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Job Description</h2>
                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                        Experience
                      </h2>
                      <p className="text-gray-700">{job.experience}</p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                        <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                        Education
                      </h2>
                      <p className="text-gray-700">{job.education}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shortlisted Candidates */}
          <div className="lg:w-1/3">
            <Card>
              <CardHeader className="flex items-center border-b border-gray-200">
                <Users className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Shortlisted Candidates</h2>
              </CardHeader>
              <CardContent>
                {shortlisted.length > 0 ? (
                  <div className="space-y-4">
                    {shortlisted.map((candidate) => (
                      <div 
                        key={candidate.id} 
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/resumes/${candidate.resume_id}`)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900">
                            {candidate.resumes?.name || 'Unnamed Resume'}
                          </h3>
                          <Badge variant="primary">
                            {candidate.match_score}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Shortlisted on {new Date(candidate.shortlisted_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No candidates shortlisted for this job yet.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/resumes')}
                    >
                      View Resumes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetailPage;