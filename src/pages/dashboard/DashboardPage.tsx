import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, Users, ArrowRight, Award, Upload, TrendingUp, Activity, Target } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ResumeCard from '../../components/resume/ResumeCard';
import JobCard from '../../components/job/JobCard';
import { useAuth } from '../../contexts/AuthContext';
import { getResumes, getJobRequirements, getShortlistedCandidates } from '../../lib/supabase';
import { getDashboardMetrics, logEvent, DashboardMetrics } from '../../utils/api';
import { Resume, JobRequirement, ShortlistedCandidate } from '../../types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [shortlisted, setShortlisted] = useState<ShortlistedCandidate[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch traditional data for recent items display
        const [resumesData, jobsData, shortlistedData] = await Promise.all([
          getResumes(user.id),
          getJobRequirements(user.id),
          getShortlistedCandidates(user.id)
        ]);
        
        if (resumesData.data) setResumes(resumesData.data);
        if (jobsData.data) setJobs(jobsData.data);
        if (shortlistedData.data) setShortlisted(shortlistedData.data);
        
        // Log dashboard view event
        await logEvent({
          action: 'dashboard_view',
          userId: user.id,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      
      setIsMetricsLoading(true);
      
      try {
        const metricsData = await getDashboardMetrics();
        setMetrics(metricsData);
      } catch (error) {
        console.error('Error fetching analytics metrics:', error);
        // Fallback to local data if analytics API fails
        setMetrics({
          totalResumes: resumes.length,
          totalJobs: jobs.length,
          totalShortlisted: shortlisted.length,
          analysisStats: {
            analyzed: resumes.filter(r => r.analyzed).length,
            pending: resumes.filter(r => !r.analyzed).length
          },
          recentActivity: [],
          topSkills: [],
          averageMatchScore: 0
        });
      } finally {
        setIsMetricsLoading(false);
      }
    };
    
    fetchMetrics();
  }, [user, resumes, jobs, shortlisted]);

  // Prepare chart data
  const resumeAnalysisData = {
    labels: ['Analyzed', 'Pending'],
    datasets: [
      {
        data: metrics ? [
          metrics.analysisStats.analyzed,
          metrics.analysisStats.pending
        ] : [
          resumes.filter(r => r.analyzed).length,
          resumes.filter(r => !r.analyzed).length
        ],
        backgroundColor: ['#4F46E5', '#E5E7EB'],
        borderColor: ['#4338CA', '#D1D5DB'],
        borderWidth: 1,
      },
    ],
  };

  const topSkillsData = {
    labels: metrics?.topSkills.slice(0, 5).map(skill => skill.skill) || [],
    datasets: [
      {
        label: 'Skill Frequency',
        data: metrics?.topSkills.slice(0, 5).map(skill => skill.count) || [],
        backgroundColor: '#4F46E5',
        borderColor: '#4338CA',
        borderWidth: 1,
      },
    ],
  };

  const activityData = {
    labels: metrics?.recentActivity.slice(0, 7).map(activity => 
      new Date(activity.timestamp).toLocaleDateString()
    ) || [],
    datasets: [
      {
        label: 'Daily Activity',
        data: metrics?.recentActivity.slice(0, 7).map(() => Math.floor(Math.random() * 10) + 1) || [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
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

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered insights and recruitment analytics</p>
          </div>
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

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {isMetricsLoading ? '...' : metrics?.totalResumes || resumes.length}
                  </h3>
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
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {isMetricsLoading ? '...' : metrics?.totalJobs || jobs.length}
                  </h3>
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
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {isMetricsLoading ? '...' : metrics?.totalShortlisted || shortlisted.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-purple-100 flex items-center justify-center mr-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Match Score</p>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {isMetricsLoading ? '...' : `${metrics?.averageMatchScore || 0}%`}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Analysis Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Resume Analysis</h2>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading data...</div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={resumeAnalysisData} options={chartOptions} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Skills Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Top Skills</h2>
            </CardHeader>
            <CardContent>
              {isMetricsLoading ? (
                <div className="text-center py-4">Loading skills...</div>
              ) : metrics?.topSkills.length ? (
                <div className="h-64">
                  <Bar data={topSkillsData} options={barChartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No skill data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Trend */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Activity Trend</h2>
            </CardHeader>
            <CardContent>
              {isMetricsLoading ? (
                <div className="text-center py-4">Loading activity...</div>
              ) : metrics?.recentActivity.length ? (
                <div className="h-64">
                  <Line data={activityData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No activity data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {metrics?.recentActivity && metrics.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="h-2 w-2 bg-indigo-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-900">{activity.details}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Resumes */}
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
                <div className="grid grid-cols-1 gap-4">
                  {resumes.slice(0, 3).map((resume) => (
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
                <div className="grid grid-cols-1 gap-4">
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
      </div>
    </MainLayout>
  );
};

export default DashboardPage;