import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Trash2, Eye } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getShortlistedCandidates, removeFromShortlist, getJobRequirements } from '../../lib/supabase';
import { ShortlistedCandidate, JobRequirement } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const ShortlistedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([]);
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [sortBy, setSortBy] = useState<'shortlisted_at' | 'match_score'>('shortlisted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch shortlisted candidates
      const { data: shortlistedData } = await getShortlistedCandidates(user.id);
      setCandidates(shortlistedData || []);
      
      // Fetch job requirements for filtering
      const { data: jobsData } = await getJobRequirements(user.id);
      setJobs(jobsData || []);
    } catch (error) {
      console.error('Error fetching shortlisted candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleRemoveCandidate = async (candidateId: string) => {
    if (!confirm('Are you sure you want to remove this candidate from the shortlist?')) {
      return;
    }
    
    try {
      const { error } = await removeFromShortlist(candidateId);
      
      if (error) throw new Error(error.message);
      
      // Update the local state
      setCandidates(candidates.filter(c => c.id !== candidateId));
      showToast('Candidate removed from shortlist', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to remove candidate',
        'error'
      );
    }
  };

  const toggleSort = (field: 'shortlisted_at' | 'match_score') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedCandidates = candidates
    .filter(candidate => {
      // Filter by job if selected
      if (selectedJob && candidate.job_requirement_id !== selectedJob) {
        return false;
      }
      
      // Filter by search query
      const resumeName = candidate.resumes?.name || '';
      const jobTitle = candidate.job_requirements?.title || '';
      
      return (
        resumeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'match_score') {
        return sortDirection === 'asc' 
          ? a.match_score - b.match_score
          : b.match_score - a.match_score;
      } else {
        return sortDirection === 'asc'
          ? new Date(a.shortlisted_at).getTime() - new Date(b.shortlisted_at).getTime()
          : new Date(b.shortlisted_at).getTime() - new Date(a.shortlisted_at).getTime();
      }
    });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Shortlisted Candidates</h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5 text-gray-400" />}
              fullWidth
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('match_score')}
              className="flex items-center"
            >
              Match Score
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort('shortlisted_at')}
              className="flex items-center"
            >
              Date
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Candidates List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-8">Loading shortlisted candidates...</div>
            ) : filteredAndSortedCandidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resume
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Job Requirement
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Match Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Shortlisted
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.resumes?.name || 'Unnamed Resume'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {candidate.job_requirements?.title || 'Unknown Job'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={
                              candidate.match_score >= 80 ? 'success' : 
                              candidate.match_score >= 60 ? 'primary' : 
                              'warning'
                            }
                          >
                            {candidate.match_score}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(candidate.shortlisted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Eye className="h-4 w-4" />}
                              onClick={() => navigate(`/resumes/${candidate.resume_id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="h-4 w-4 text-red-500" />}
                              onClick={() => handleRemoveCandidate(candidate.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shortlisted candidates found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedJob
                    ? 'No candidates match your search criteria. Try adjusting your filters.'
                    : 'Start shortlisting candidates by analyzing resumes against job requirements.'}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/resumes')}
                  >
                    View Resumes
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/jobs')}
                  >
                    View Jobs
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ShortlistedPage;