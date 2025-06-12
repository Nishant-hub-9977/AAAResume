import express from 'express';
import multer from 'multer';
import { scoreResume, generateResumeInsights } from '../libs/vertex.js';
import { uploadFile } from '../libs/storage.js';
import { validateRequest, resumeAnalysisSchema, fileUploadSchema, sanitizeInput } from '../utils/validation.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// POST /api/ai/analyze-resume - Analyze resume against job requirements
router.post('/analyze-resume', validateRequest(resumeAnalysisSchema), async (req, res) => {
  try {
    const { resume, job } = sanitizeInput(req.body);
    
    console.log('🤖 Starting AI resume analysis...');
    const analysis = await scoreResume(resume, job);
    
    res.status(200).json({
      success: true,
      analysis: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error analyzing resume:', error);
    res.status(500).json({
      error: 'Failed to analyze resume',
      message: error.message
    });
  }
});

// POST /api/ai/upload-resume - Upload and analyze resume file
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a resume file'
      });
    }
    
    // Validate file
    const fileValidation = fileUploadSchema.validate({
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    if (fileValidation.error) {
      return res.status(400).json({
        error: 'Invalid file',
        details: fileValidation.error.details
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `resumes/${timestamp}-${req.file.originalname}`;
    
    // Upload to Cloud Storage
    const uploadResult = await uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );
    
    // For now, return upload success
    // In a real implementation, you'd extract text from the file and analyze it
    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      file: {
        originalName: req.file.originalname,
        fileName: fileName,
        size: req.file.size,
        url: uploadResult.publicUrl
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error uploading resume:', error);
    res.status(500).json({
      error: 'Failed to upload resume',
      message: error.message
    });
  }
});

// GET /api/ai/resume-insights/:resumeId - Get AI insights for a specific resume
router.get('/resume-insights/:resumeId', async (req, res) => {
  try {
    const { resumeId } = req.params;
    
    // In a real implementation, you'd fetch the resume content from your database
    // For now, we'll return mock insights
    const insights = {
      score: 78,
      skillsMatch: 85,
      experienceMatch: 72,
      strengths: [
        'Strong technical background',
        'Relevant industry experience',
        'Good educational qualifications'
      ],
      weaknesses: [
        'Could benefit from more leadership experience',
        'Some newer technologies not mentioned'
      ],
      recommendations: [
        'Consider for technical interview',
        'Assess leadership potential during interview'
      ]
    };
    
    res.status(200).json({
      success: true,
      resumeId: resumeId,
      insights: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching resume insights:', error);
    res.status(500).json({
      error: 'Failed to fetch resume insights',
      message: error.message
    });
  }
});

// POST /api/ai/batch-analyze - Analyze multiple resumes against a job requirement
router.post('/batch-analyze', async (req, res) => {
  try {
    const { resumes, job } = req.body;
    
    if (!Array.isArray(resumes) || resumes.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide an array of resumes'
      });
    }
    
    if (!job) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide job requirements'
      });
    }
    
    console.log(`🤖 Starting batch analysis for ${resumes.length} resumes...`);
    
    const analyses = await Promise.all(
      resumes.map(async (resume, index) => {
        try {
          const analysis = await scoreResume(resume.content, job);
          return {
            resumeId: resume.id || `resume_${index}`,
            analysis: analysis,
            success: true
          };
        } catch (error) {
          return {
            resumeId: resume.id || `resume_${index}`,
            error: error.message,
            success: false
          };
        }
      })
    );
    
    const successful = analyses.filter(a => a.success);
    const failed = analyses.filter(a => !a.success);
    
    res.status(200).json({
      success: true,
      message: `Analyzed ${successful.length} resumes successfully`,
      results: analyses,
      summary: {
        total: resumes.length,
        successful: successful.length,
        failed: failed.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in batch analysis:', error);
    res.status(500).json({
      error: 'Failed to perform batch analysis',
      message: error.message
    });
  }
});

// GET /api/ai/health - Health check for AI service
router.get('/health', async (req, res) => {
  try {
    // Simple health check - try to initialize Vertex AI
    const { generateResumeInsights } = await import('../libs/vertex.js');
    
    res.status(200).json({
      status: 'healthy',
      service: 'ai',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ AI health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'ai',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;