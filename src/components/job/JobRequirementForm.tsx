import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { saveJobRequirement } from '../../lib/supabase';
import { logEvent } from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';

interface JobRequirementFormProps {
  onSuccess: () => void;
}

const JobRequirementForm: React.FC<JobRequirementFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [''],
    experience: '',
    education: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...formData.skills];
    updatedSkills[index] = value;
    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  const addSkill = () => {
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index: number) => {
    if (formData.skills.length > 1) {
      const updatedSkills = [...formData.skills];
      updatedSkills.splice(index, 1);
      setFormData((prev) => ({ ...prev, skills: updatedSkills }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      showToast('You must be logged in to create a job requirement', 'error');
      return;
    }
    
    // Filter out empty skills
    const filteredSkills = formData.skills.filter((skill) => skill.trim() !== '');
    
    if (filteredSkills.length === 0) {
      showToast('Please add at least one skill', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await saveJobRequirement({
        ...formData,
        skills: filteredSkills,
        user_id: user.id,
      });
      
      if (error) throw new Error(error.message);
      
      // Log analytics event for job creation
      await logEvent({
        action: 'job_requirement_create',
        jobId: data?.id,
        userId: user.id,
        timestamp: new Date().toISOString(),
        metadata: {
          title: formData.title,
          skillsCount: filteredSkills.length,
          descriptionLength: formData.description.length
        }
      });
      
      showToast('Job requirement created successfully', 'success');
      onSuccess();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        skills: [''],
        experience: '',
        education: '',
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create job requirement',
        'error'
      );
      
      // Log error event
      await logEvent({
        action: 'job_requirement_create_error',
        userId: user.id,
        timestamp: new Date().toISOString(),
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Job Title"
        id="title"
        name="title"
        placeholder="e.g., Senior Software Engineer"
        value={formData.title}
        onChange={handleChange}
        required
        fullWidth
      />
      
      <Textarea
        label="Job Description"
        id="description"
        name="description"
        placeholder="Describe the job role and responsibilities"
        value={formData.description}
        onChange={handleChange}
        required
        rows={5}
        fullWidth
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Skills
        </label>
        {formData.skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input
              placeholder="e.g., JavaScript"
              value={skill}
              onChange={(e) => handleSkillChange(index, e.target.value)}
              fullWidth
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSkill(index)}
              disabled={formData.skills.length <= 1}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSkill}
          className="mt-1"
          icon={<Plus className="h-4 w-4 mr-1" />}
        >
          Add Skill
        </Button>
      </div>
      
      <Input
        label="Experience Required"
        id="experience"
        name="experience"
        placeholder="e.g., 3+ years of experience in web development"
        value={formData.experience}
        onChange={handleChange}
        required
        fullWidth
      />
      
      <Input
        label="Education"
        id="education"
        name="education"
        placeholder="e.g., Bachelor's degree in Computer Science or related field"
        value={formData.education}
        onChange={handleChange}
        required
        fullWidth
      />
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          fullWidth
        >
          Create Job Requirement
        </Button>
      </div>
    </div>
  );
};

export default JobRequirementForm;