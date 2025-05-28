import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, Users, ArrowRight, Award, Upload } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ResumeCard from '../../components/resume/ResumeCard';
import JobCard from '../../components/job/JobCard';
import { useAuth } from '../../contexts/AuthContext';
import { getResumes, getJobRequirements, getShortlistedCandidates } from '../../lib/supabase';
import { Resume, JobRequirement, ShortlistedCandidate } from '../../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [shortlisted, setShortlisted] = useState<ShortlistedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch resumes
        const { data: resumesData } = await getResumes(user.id);
        if (resumesData) setResumes(resumesData);
        
        // Fetch job requirements
        const { data: jobsData } = await getJobRequirements(user.id);
        if (jobsData) setJobs(jobsData);
        
        // Fetch shortlisted candidates
        const { data: shortlistedData } = await getShortlistedCandidates(user.id);
        if (shortlistedData) setShortlisted(shortlistedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Prepare chart data
  const resumeAnalysisData = {
    labels: ['Analyzed', 'Pending'],
    datasets: [
      {
        data: [
          resumes.filter(r => r.analyzed).length,
          resumes.filter(r => !r.analyzed).length
        ],
        backgroundColor: ['#4F46E5', '#E5E7EB'],
        borderColor: ['#4338CA', '#D1D5DB'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex space-x-2">
            <Link to="/resumes">
              <Button 
                variant="outline" 
                size="sm"
                icon={<Upload className="h-4 w-4 mr-1" />}
              >
                Upload Resume
              </Button>
            </Link>
            <Link to="/jobs">
              <Button 
                variant="primary" 
                size="sm"
                icon={<Briefcase className="h-4 w-4 mr-1" />}
              >
                Add Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                  <h3 className="text-2xl font-semibold text-gray-900">{resumes.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-blue-100 flex items-center justify-center mr-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Requirements</p>
                  <h3 className="text-2xl font-semibold text-gray-900">{jobs.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-green-100 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Shortlisted</p>
                  <h3 className="text-2xl font-semibold text-gray-900">{shortlisted.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Resumes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Recent Resumes</h2>
                <Link to="/resumes" className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="text-center py-4">Loading resumes...</div>
                ) : resumes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes.slice(0, 4).map((resume) => (
                      <ResumeCard key={resume.id} resume={resume} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes yet</h3>
                    <p className="text-gray-500 mb-4">Upload your first resume to get started</p>
                    <Link to="/resumes">
                      <Button 
                        variant="primary"
                        icon={<Upload className="h-4 w-4 mr-1" />}
                      >
                        Upload Resume
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resume Analysis Chart */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Resume Analysis</h2>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading data...</div>
                ) : resumes.length > 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <Doughnut data={resumeAnalysisData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Upload resumes to see analysis stats</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Job Requirements */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Job Requirements</h2>
            <Link to="/jobs" className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-4">Loading job requirements...</div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {jobs.slice(0, 3).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No job requirements yet</h3>
                <p className="text-gray-500 mb-4">Add your first job requirement to match with resumes</p>
                <Link to="/jobs">
                  <Button 
                    variant="primary"
                    icon={<Briefcase className="h-4 w-4 mr-1" />}
                  >
                    Add Job Requirement
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;