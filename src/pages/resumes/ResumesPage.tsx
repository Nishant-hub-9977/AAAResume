import React, { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpDown, Sliders } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ResumeCard from '../../components/resume/ResumeCard';
import ResumeUploader from '../../components/resume/ResumeUploader';
import { useAuth } from '../../contexts/AuthContext';
import { getResumes, deleteResume } from '../../lib/supabase';
import { Resume } from '../../types';
import { useToast } from '../../contexts/ToastContext';

const ResumesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'uploaded_at' | 'name'>('uploaded_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchResumes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await getResumes(user.id);
      
      if (error) throw error;
      
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      showToast('Failed to load resumes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const handleUploadSuccess = () => {
    setShowUploader(false);
    fetchResumes();
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (!user) return;
    
    try {
      const { error } = await deleteResume(resumeId, user.id);
      
      if (error) throw error;
      
      setResumes(resumes.filter(resume => resume.id !== resumeId));
      showToast('Resume deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting resume:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to delete resume',
        'error'
      );
    }
  };

  const toggleSort = (field: 'uploaded_at' | 'name') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedResumes = resumes
    .filter(resume => 
      resume.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc'
          ? new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime()
          : new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      }
    });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          {!showUploader && (
            <Button 
              variant="primary" 
              onClick={() => setShowUploader(true)}
              icon={<Plus className="h-4 w-4 mr-1" />}
            >
              Upload Resume
            </Button>
          )}
        </div>

        {showUploader ? (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Upload New Resume</h2>
            </CardHeader>
            <CardContent>
              <ResumeUploader onUploadSuccess={handleUploadSuccess} />
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUploader(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search resumes..."
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
                  onClick={() => toggleSort('name')}
                  className="flex items-center"
                >
                  Name
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSort('uploaded_at')}
                  className="flex items-center"
                >
                  Date
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center"
                >
                  <Sliders className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Resumes Grid */}
            <div className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">Loading resumes...</div>
              ) : filteredAndSortedResumes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedResumes.map((resume) => (
                    <ResumeCard 
                      key={resume.id} 
                      resume={resume}
                      onDelete={handleDeleteResume}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
                    {searchQuery ? (
                      <p className="text-gray-500 mb-4">
                        No resumes match your search criteria. Try a different search term or upload a new resume.
                      </p>
                    ) : (
                      <p className="text-gray-500 mb-4">
                        Upload your first resume to get started with AI analysis and shortlisting.
                      </p>
                    )}
                    <Button 
                      variant="primary" 
                      onClick={() => setShowUploader(true)}
                      icon={<Plus className="h-4 w-4 mr-1" />}
                    >
                      Upload Resume
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

export default ResumesPage;