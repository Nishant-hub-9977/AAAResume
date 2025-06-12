import express from 'express';
import { logEvent } from '../libs/bigquery.js';
import { validateRequest, analyticsEventSchema, sanitizeInput } from '../utils/validation.js';

const router = express.Router();

// POST /api/analytics/events - Log analytics event
router.post('/events', validateRequest(analyticsEventSchema), async (req, res) => {
  try {
    const eventData = sanitizeInput(req.body);
    
    const result = await logEvent(eventData);
    
    res.status(201).json({
      success: true,
      message: 'Event logged successfully',
      eventId: result.eventId
    });
  } catch (error) {
    console.error('❌ Error logging analytics event:', error);
    res.status(500).json({
      error: 'Failed to log analytics event',
      message: error.message
    });
  }
});

// GET /api/analytics/health - Health check for analytics service
router.get('/health', async (req, res) => {
  try {
    // Simple health check - try to connect to BigQuery
    const { ensureDatasetAndTable } = await import('../libs/bigquery.js');
    await ensureDatasetAndTable();
    
    res.status(200).json({
      status: 'healthy',
      service: 'analytics',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Analytics health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'analytics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/analytics/dashboard - Get dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    const { queryMetrics } = await import('../libs/bigquery.js');
    const metrics = await queryMetrics();
    
    // Process and format metrics for dashboard
    const dashboardData = {
      totalResumes: getEventCount(metrics.eventsByAction, 'resume_upload'),
      totalJobs: getEventCount(metrics.eventsByAction, 'job_requirement_create'),
      totalShortlisted: getEventCount(metrics.eventsByAction, 'candidate_shortlist'),
      analysisStats: {
        analyzed: getEventCount(metrics.eventsByAction, 'ai_analysis'),
        pending: Math.max(0, getEventCount(metrics.eventsByAction, 'resume_upload') - getEventCount(metrics.eventsByAction, 'ai_analysis'))
      },
      recentActivity: metrics.recentActivity.map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp,
        details: formatActivityDetails(activity)
      })),
      topSkills: extractTopSkills(metrics.recentActivity),
      averageMatchScore: calculateAverageMatchScore(metrics.recentActivity)
    };
    
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('❌ Error fetching dashboard metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      message: error.message
    });
  }
});

// Helper functions
const getEventCount = (eventsByAction, action) => {
  const event = eventsByAction.find(e => e.action === action);
  return event ? event.count : 0;
};

const formatActivityDetails = (activity) => {
  const actionMap = {
    'resume_upload': 'Resume uploaded',
    'job_requirement_create': 'Job requirement created',
    'candidate_shortlist': 'Candidate shortlisted',
    'ai_analysis': 'AI analysis performed',
    'dashboard_view': 'Dashboard viewed',
    'resume_view': 'Resume viewed'
  };
  
  return actionMap[activity.action] || activity.action;
};

const extractTopSkills = (activities) => {
  const skillCounts = {};
  
  activities.forEach(activity => {
    if (activity.metadata) {
      try {
        const metadata = typeof activity.metadata === 'string' 
          ? JSON.parse(activity.metadata) 
          : activity.metadata;
        
        if (metadata.skills) {
          metadata.skills.forEach(skill => {
            skillCounts[skill] = (skillCounts[skill] || 0) + 1;
          });
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
  });
  
  return Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

const calculateAverageMatchScore = (activities) => {
  const scores = activities
    .filter(activity => activity.action === 'ai_analysis' || activity.action === 'candidate_shortlist')
    .map(activity => {
      try {
        const metadata = typeof activity.metadata === 'string' 
          ? JSON.parse(activity.metadata) 
          : activity.metadata;
        return metadata?.matchScore || metadata?.score || 0;
      } catch (error) {
        return 0;
      }
    })
    .filter(score => score > 0);
  
  if (scores.length === 0) return 0;
  
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
};

export default router;