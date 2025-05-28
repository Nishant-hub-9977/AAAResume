import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { Briefcase, Calendar } from 'lucide-react';
import { JobRequirement } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: JobRequirement;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <Link to={`/jobs/${job.id}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-start">
            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-indigo-50 mr-3">
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {job.title}
              </h3>
              <div className="mt-1 flex items-center text-xs text-gray-500">
                <Calendar className="mr-1 h-3 w-3" />
                <span>
                  Created {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-xs text-gray-600 line-clamp-2">
              {job.description}
            </p>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="primary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default JobCard;