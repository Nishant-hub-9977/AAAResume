import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { uploadResume } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ResumeUploaderProps {
  onUploadSuccess: () => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!fileExt || !['pdf', 'docx', 'doc'].includes(fileExt)) {
        setError('Only PDF, DOCX, and DOC files are supported.');
        setFile(null);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('File size should not exceed 5MB.');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const { data, error } = await uploadResume(file, user.id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const fileExt = droppedFile.name.split('.').pop()?.toLowerCase();
      
      if (!fileExt || !['pdf', 'docx', 'doc'].includes(fileExt)) {
        setError('Only PDF, DOCX, and DOC files are supported.');
        return;
      }
      
      if (droppedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('File size should not exceed 5MB.');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900">Upload Resume</h3>
          
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop a file here, or click to select a file
          </p>
          
          <p className="text-xs text-gray-400 mt-2">
            Supports PDF, DOCX, DOC (Max 5MB)
          </p>
          
          {file && (
            <div className="mt-4 p-2 bg-indigo-50 rounded flex items-center">
              <span className="text-sm font-medium text-indigo-700 truncate max-w-xs">
                {file.name}
              </span>
            </div>
          )}
          
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          isLoading={isUploading}
          disabled={!file || isUploading}
          onClick={handleUpload}
          className="px-4 py-2"
        >
          Upload Resume
        </Button>
      </div>
    </div>
  );
};

export default ResumeUploader;