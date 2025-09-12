import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with admin privileges
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase configuration:');
  console.error('- SUPABASE_URL:', supabaseUrl ? 'configured' : 'MISSING');
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'configured' : 'MISSING');
  console.error('Please set both environment variables from your Supabase dashboard');
  throw new Error('Supabase configuration incomplete');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket configuration
export const STORAGE_BUCKET = 'resumes';

// Initialize storage bucket if it doesn't exist
export async function initializeStorage() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.warn('Could not list storage buckets:', listError.message);
      console.log('Storage bucket may need to be created manually in Supabase dashboard');
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Try to create bucket but handle permission errors gracefully
      const { error } = await supabaseAdmin.storage.createBucket(STORAGE_BUCKET, {
        public: false, // Keep private for security
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        console.warn('Could not create storage bucket automatically:', error.message);
        console.log(`Please create the "${STORAGE_BUCKET}" bucket manually in your Supabase dashboard`);
        console.log('Make sure to set it as private and allow the required MIME types');
      } else {
        console.log('Storage bucket created successfully');
      }
    } else {
      console.log('Storage bucket already exists');
    }
  } catch (error) {
    console.warn('Error initializing storage:', error);
    console.log('File upload functionality may not work until the storage bucket is created');
  }
}

// Helper function to upload file
export async function uploadFile(
  userId: string,
  submissionId: string,
  file: Express.Multer.File
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Check if bucket exists first
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Cannot access Supabase storage:', listError);
      return { 
        success: false, 
        error: 'Storage service unavailable. Please contact support.' 
      };
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    if (!bucketExists) {
      console.error(`Storage bucket '${STORAGE_BUCKET}' does not exist`);
      return { 
        success: false, 
        error: 'File storage is not configured. Please contact support to enable file uploads.' 
      };
    }

    const filePath = `${userId}/${submissionId}/${Date.now()}-${file.originalname}`;
    
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        return { 
          success: false, 
          error: 'File upload permissions not configured. Please contact support.' 
        };
      }
      
      return { 
        success: false, 
        error: `Upload failed: ${error.message}` 
      };
    }

    console.log('File uploaded successfully:', data.path);
    return { success: true, path: data.path };
  } catch (error) {
    console.error('Upload file error:', error);
    return { 
      success: false, 
      error: 'Upload service temporarily unavailable. Please try again later.' 
    };
  }
}

// Helper function to delete file
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
}

// Helper function to get signed URL for file download
export async function getFileUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Get file URL error:', error);
    return null;
  }
}