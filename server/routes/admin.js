import express from 'express';
import { queryMetrics, getUserAnalytics } from '../libs/bigquery.js';
import { listFiles } from '../libs/storage.js';

const router = express.Router();

// GET /api/admin/dashboard - Get comprehensive admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    console.log('📊 Fetching admin dashboard metrics...');
    
    const metrics = await queryMetrics();
    
    // Process metrics for admin dashboard
    const dashboardData = {
      overview: {
        totalEvents: metrics.totalEvents[0]?.total || 0,
        totalUsers: getUniqueUserCount(metrics.recentActivity),
        activeUsers: getActiveUserCount(metrics.recentActivity),
        systemHealth: 'healthy'
      },
      eventBreakdown: metrics.eventsByAction.map(event => ({
        action: event.action,
        count: event.count,
        percentage: 0 // Will be calculated on frontend
      })),
      recentActivity: metrics.recentActivity.slice(0, 20).map(activity => ({
        action: activity.action,
        timestamp: activity.timestamp,
        userId: activity.user_id,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      })),
      dailyActivity: metrics.dailyActivity.map(day => ({
        date: day.date,
        count: day.count
      })),
      topActions: metrics.eventsByAction.slice(0, 5),
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('❌ Error fetching admin dashboard:', error);
    res.status(500).json({
      error: 'Failed to fetch admin dashboard data',
      message: error.message
    });
  }
});

// GET /api/admin/users/:userId/analytics - Get analytics for specific user
router.get('/users/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'User ID is required'
      });
    }
    
    const userAnalytics = await getUserAnalytics(userId);
    
    res.status(200).json({
      success: true,
      userId: userId,
      analytics: userAnalytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching user analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch user analytics',
      message: error.message
    });
  }
});

// GET /api/admin/storage/stats - Get storage statistics
router.get('/storage/stats', async (req, res) => {
  try {
    const files = await listFiles();
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + parseInt(file.size || 0), 0),
      fileTypes: getFileTypeBreakdown(files),
      recentFiles: files
        .sort((a, b) => new Date(b.timeCreated) - new Date(a.timeCreated))
        .slice(0, 10)
        .map(file => ({
          name: file.name,
          size: file.size,
          contentType: file.contentType,
          created: file.timeCreated
        }))
    };
    
    res.status(200).json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching storage stats:', error);
    res.status(500).json({
      error: 'Failed to fetch storage statistics',
      message: error.message
    });
  }
});

// GET /api/admin/system/health - Comprehensive system health check
router.get('/system/health', async (req, res) => {
  try {
    const healthChecks = {
      bigquery: await checkBigQueryHealth(),
      vertexai: await checkVertexAIHealth(),
      storage: await checkStorageHealth(),
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };
    
    const overallHealth = Object.values(healthChecks).every(check => 
      check.status === 'healthy'
    ) ? 'healthy' : 'degraded';
    
    res.status(200).json({
      success: true,
      overallHealth: overallHealth,
      services: healthChecks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error checking system health:', error);
    res.status(500).json({
      success: false,
      overallHealth: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions
const getUniqueUserCount = (activities) => {
  const uniqueUsers = new Set(activities.map(activity => activity.user_id));
  return uniqueUsers.size;
};

const getActiveUserCount = (activities) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivities = activities.filter(activity => 
    new Date(activity.timestamp) > oneDayAgo
  );
  const activeUsers = new Set(recentActivities.map(activity => activity.user_id));
  return activeUsers.size;
};

const getFileTypeBreakdown = (files) => {
  const breakdown = {};
  files.forEach(file => {
    const type = file.contentType || 'unknown';
    breakdown[type] = (breakdown[type] || 0) + 1;
  });
  return breakdown;
};

const checkBigQueryHealth = async () => {
  try {
    const { ensureDatasetAndTable } = await import('../libs/bigquery.js');
    await ensureDatasetAndTable();
    return { status: 'healthy', message: 'BigQuery connection successful' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

const checkVertexAIHealth = async () => {
  try {
    // Simple check - just try to import the module
    await import('../libs/vertex.js');
    return { status: 'healthy', message: 'Vertex AI client initialized' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

const checkStorageHealth = async () => {
  try {
    const { ensureBucket } = await import('../libs/storage.js');
    await ensureBucket();
    return { status: 'healthy', message: 'Cloud Storage connection successful' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

export default router;