import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. File upload will be disabled.');
}

// Create Supabase client (server-side, minimal auth config)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Storage bucket name for uploads
export const STORAGE_BUCKET = 'resumes';

// Helper function to create upload path
export function createUploadPath(userId: string, submissionId: string, filename: string): string {
  // Organize files by user and submission for better structure
  return `${userId}/${submissionId}/${filename}`;
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Allowed file types
export const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'doc'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Helper function to validate file
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const extension = getFileExtension(file.name);
  if (!ALLOWED_FILE_TYPES.includes(extension)) {
    return { valid: false, error: 'Only PDF, DOC, and DOCX files are allowed' };
  }

  return { valid: true };
}