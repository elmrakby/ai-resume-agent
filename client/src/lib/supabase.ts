import { createClient } from '@supabase/supabase-js';

// Client-side Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. File upload will be disabled.');
}

// Create client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We handle auth separately
  },
});

// Storage bucket name
export const STORAGE_BUCKET = 'uploads';

// File validation helpers
export const ALLOWED_FILE_TYPES = ['pdf', 'docx', 'doc'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_FILE_TYPES.includes(extension)) {
    return { valid: false, error: 'Only PDF, DOC, and DOCX files are allowed' };
  }

  return { valid: true };
}

// Helper to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Helper to create upload path
export function createUploadPath(userId: string, submissionId: string, filename: string): string {
  return `${userId}/${submissionId}/${filename}`;
}