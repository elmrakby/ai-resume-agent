import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with admin privileges
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Storage bucket configuration
export const STORAGE_BUCKET = 'uploads';

// Initialize storage bucket if it doesn't exist
export async function initializeStorage() {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      // Create bucket with public read access
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
        console.error('Error creating storage bucket:', error);
      } else {
        console.log('Storage bucket created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Helper function to upload file
export async function uploadFile(
  userId: string,
  submissionId: string,
  file: Express.Multer.File
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
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
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (error) {
    console.error('Upload file error:', error);
    return { success: false, error: 'Failed to upload file' };
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