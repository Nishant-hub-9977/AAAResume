import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpDown } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import JobCard from '../../components/job/JobCard';
import JobRequirementForm from '../../components/job/JobRequirementForm';
import { useAuth } from '../../contexts/AuthContext';
import { getJobRequirements } from '../../lib/supabase';
import { JobRequirement } from '../../types';

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'title'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchJobs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await getJobRequirements(user.id);
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching job requirements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchJobs();
  };

  const toggleSort = (field: 'created_at' | 'title') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedJobs = jobs
    .filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      } else {
        return sortDirection === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Job Requirements</h1>
          {!showForm && (
            <Button 
              variant="primary" 
              onClick={() => setShowForm(true)}
              icon={<Plus className="h-4 w-4 mr-1" />}
            >
              Add Job Requirement
            </Button>
          )}
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Add New Job Requirement</h2>
            </CardHeader>
            <CardContent>
              <JobRequirementForm onSuccess={handleFormSuccess} />
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search job requirements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-5 w-5 text-gray-400" />}
                  fullWidth
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('title')}
                  className="flex items-center"
                >
                  Title
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('created_at')}
                  className="flex items-center"
                >
                  Date
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading job requirements...</div>
              ) : filteredAndSortedJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No job requirements found</h3>
                    {searchQuery ? (
                      <p className="text-gray-500 mb-4">
                        No job requirements match your search criteria. Try a different search term or add a new job requirement.
                      </p>
                    ) : (
                      <p className="text-gray-500 mb-4">
                        Add your first job requirement to start matching with resumes.
                      </p>
                    )}
                    <Button 
                      variant="primary" 
                      onClick={() => setShowForm(true)}
                      icon={<Plus className="h-4 w-4 mr-1" />}
                    >
                      Add Job Requirement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default JobsPage;