import React from 'react';
import { Link } from 'react-router-dom';
import { File, FileText, Clock, Award } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { Resume } from '../../types';

interface ResumeCardProps {
  resume: Resume;
  showAnalysisStatus?: boolean;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ 
  resume, 
  showAnalysisStatus = true 
}) => {
  const fileTypeIcon = () => {
    switch (resume.file_type) {
      case 'pdf':
        return <File className="text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="text-blue-500" />;
      default:
        return <FileText className="text-gray-500" />;
    }
  };

  const getFileTypeLabel = () => {
    switch (resume.file_type) {
      case 'pdf':
        return 'PDF';
      case 'docx':
        return 'Word';
      case 'doc':
        return 'Word';
      default:
        return resume.file_type.toUpperCase();
    }
  };

  return (
    <Link to={`/resumes/${resume.id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-indigo-50 mr-3">
              {fileTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {resume.name}
              </h3>
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                  Uploaded {formatDistanceToNow(new Date(resume.uploaded_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {getFileTypeLabel()}
            </Badge>
            
            {showAnalysisStatus && (
              resume.analyzed ? (
                <Badge variant="success" className="flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  Analyzed
                </Badge>
              ) : (
                <Badge variant="warning">Pending Analysis</Badge>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ResumeCard;