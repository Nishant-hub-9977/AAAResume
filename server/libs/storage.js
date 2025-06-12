import { Storage } from '@google-cloud/storage';

let storageClient = null;

// Initialize Cloud Storage client
const initializeStorage = () => {
  if (storageClient) return storageClient;
  
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    
    storageClient = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials
    });
    
    console.log('✅ Cloud Storage client initialized successfully');
    return storageClient;
  } catch (error) {
    console.error('❌ Failed to initialize Cloud Storage client:', error);
    throw new Error('Cloud Storage initialization failed');
  }
};

// Ensure bucket exists
export const ensureBucket = async () => {
  const client = initializeStorage();
  const bucketName = process.env.STORAGE_BUCKET;
  
  try {
    const [buckets] = await client.getBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await client.createBucket(bucketName, {
        location: 'US',
        storageClass: 'STANDARD',
        uniformBucketLevelAccess: true
      });
      console.log(`🪣 Created Cloud Storage bucket: ${bucketName}`);
    }
    
    return client.bucket(bucketName);
  } catch (error) {
    console.error('❌ Error ensuring bucket exists:', error);
    throw error;
  }
};

// Upload file to Cloud Storage
export const uploadFile = async (fileBuffer, fileName, contentType) => {
  try {
    const bucket = await ensureBucket();
    const file = bucket.file(fileName);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: contentType,
        cacheControl: 'public, max-age=31536000', // 1 year
      },
      resumable: false
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('❌ Error uploading file:', error);
        reject(error);
      });
      
      stream.on('finish', async () => {
        try {
          // Make file publicly readable (optional)
          await file.makePublic();
          
          const publicUrl = `https://storage.googleapis.com/${process.env.STORAGE_BUCKET}/${fileName}`;
          console.log(`📁 File uploaded successfully: ${fileName}`);
          
          resolve({
            fileName,
            publicUrl,
            bucket: process.env.STORAGE_BUCKET
          });
        } catch (error) {
          reject(error);
        }
      });
      
      stream.end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Error in uploadFile:', error);
    throw error;
  }
};

// Delete file from Cloud Storage
export const deleteFile = async (fileName) => {
  try {
    const bucket = await ensureBucket();
    const file = bucket.file(fileName);
    
    await file.delete();
    console.log(`🗑️ File deleted successfully: ${fileName}`);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

// Get signed URL for file access
export const getSignedUrl = async (fileName, action = 'read', expiresIn = 3600) => {
  try {
    const bucket = await ensureBucket();
    const file = bucket.file(fileName);
    
    const options = {
      version: 'v4',
      action: action,
      expires: Date.now() + expiresIn * 1000, // Convert to milliseconds
    };
    
    const [url] = await file.getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw error;
  }
};

// List files in bucket
export const listFiles = async (prefix = '') => {
  try {
    const bucket = await ensureBucket();
    const [files] = await bucket.getFiles({ prefix });
    
    return files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      timeCreated: file.metadata.timeCreated,
      updated: file.metadata.updated
    }));
  } catch (error) {
    console.error('❌ Error listing files:', error);
    throw error;
  }
};

export default {
  uploadFile,
  deleteFile,
  getSignedUrl,
  listFiles,
  ensureBucket
};