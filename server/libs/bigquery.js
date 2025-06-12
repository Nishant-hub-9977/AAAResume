import { BigQuery } from '@google-cloud/bigquery';

let bigQueryClient = null;

// Initialize BigQuery client
const initializeBigQuery = () => {
  if (bigQueryClient) return bigQueryClient;
  
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    
    bigQueryClient = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });
    
    console.log('✅ BigQuery client initialized successfully');
    return bigQueryClient;
  } catch (error) {
    console.error('❌ Failed to initialize BigQuery client:', error);
    throw new Error('BigQuery initialization failed');
  }
};

// Ensure dataset and table exist
export const ensureDatasetAndTable = async () => {
  const client = initializeBigQuery();
  const datasetId = process.env.BIGQUERY_DATASET;
  const tableId = process.env.BIGQUERY_TABLE;
  
  try {
    // Check if dataset exists, create if not
    const [datasets] = await client.getDatasets();
    const datasetExists = datasets.some(dataset => dataset.id === datasetId);
    
    if (!datasetExists) {
      await client.createDataset(datasetId, {
        location: 'US',
        description: 'Resume analytics data'
      });
      console.log(`📊 Created BigQuery dataset: ${datasetId}`);
    }
    
    const dataset = client.dataset(datasetId);
    
    // Check if table exists, create if not
    const [tables] = await dataset.getTables();
    const tableExists = tables.some(table => table.id === tableId);
    
    if (!tableExists) {
      const schema = [
        { name: 'event_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'action', type: 'STRING', mode: 'REQUIRED' },
        { name: 'user_id', type: 'STRING', mode: 'REQUIRED' },
        { name: 'resume_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'job_id', type: 'STRING', mode: 'NULLABLE' },
        { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
        { name: 'metadata', type: 'JSON', mode: 'NULLABLE' },
        { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED', defaultValueExpression: 'CURRENT_TIMESTAMP()' }
      ];
      
      await dataset.createTable(tableId, { schema });
      console.log(`📋 Created BigQuery table: ${tableId}`);
    }
    
    return { dataset, table: dataset.table(tableId) };
  } catch (error) {
    console.error('❌ Error ensuring dataset and table:', error);
    throw error;
  }
};

// Log analytics event to BigQuery
export const logEvent = async (eventData) => {
  try {
    const client = initializeBigQuery();
    const { table } = await ensureDatasetAndTable();
    
    const row = {
      event_id: `${eventData.userId}_${eventData.action}_${Date.now()}`,
      action: eventData.action,
      user_id: eventData.userId,
      resume_id: eventData.resumeId || null,
      job_id: eventData.jobId || null,
      timestamp: new Date(eventData.timestamp).toISOString(),
      metadata: eventData.metadata ? JSON.stringify(eventData.metadata) : null
    };
    
    await table.insert([row]);
    console.log(`📝 Logged event: ${eventData.action} for user ${eventData.userId}`);
    
    return { success: true, eventId: row.event_id };
  } catch (error) {
    console.error('❌ Error logging event to BigQuery:', error);
    throw error;
  }
};

// Query dashboard metrics from BigQuery
export const queryMetrics = async () => {
  try {
    const client = initializeBigQuery();
    
    const queries = {
      totalEvents: `
        SELECT COUNT(*) as total
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${process.env.BIGQUERY_TABLE}\`
        WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      `,
      
      eventsByAction: `
        SELECT action, COUNT(*) as count
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${process.env.BIGQUERY_TABLE}\`
        WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY action
        ORDER BY count DESC
      `,
      
      recentActivity: `
        SELECT action, timestamp, user_id, metadata
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${process.env.BIGQUERY_TABLE}\`
        WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        ORDER BY timestamp DESC
        LIMIT 50
      `,
      
      dailyActivity: `
        SELECT DATE(timestamp) as date, COUNT(*) as count
        FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${process.env.BIGQUERY_TABLE}\`
        WHERE DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `
    };
    
    const results = {};
    
    for (const [key, query] of Object.entries(queries)) {
      try {
        const [rows] = await client.query({ query });
        results[key] = rows;
      } catch (queryError) {
        console.error(`❌ Error executing query ${key}:`, queryError);
        results[key] = [];
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error querying metrics from BigQuery:', error);
    throw error;
  }
};

// Get user-specific analytics
export const getUserAnalytics = async (userId) => {
  try {
    const client = initializeBigQuery();
    
    const query = `
      SELECT 
        action,
        COUNT(*) as count,
        MAX(timestamp) as last_action
      FROM \`${process.env.GOOGLE_CLOUD_PROJECT_ID}.${process.env.BIGQUERY_DATASET}.${process.env.BIGQUERY_TABLE}\`
      WHERE user_id = @userId
        AND DATE(timestamp) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      GROUP BY action
      ORDER BY count DESC
    `;
    
    const options = {
      query,
      params: { userId }
    };
    
    const [rows] = await client.query(options);
    return rows;
  } catch (error) {
    console.error('❌ Error getting user analytics:', error);
    throw error;
  }
};

export default {
  logEvent,
  queryMetrics,
  getUserAnalytics,
  ensureDatasetAndTable
};