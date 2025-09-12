import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useStorageStatus } from "@/hooks/useStorageStatus";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { UploadCloud, FileText } from "lucide-react";
import { validateFile as validateFileSupabase } from "@/lib/supabase";

const submissionSchema = z.object({
  roleTarget: z.string().min(1, "Target role is required"),
  industry: z.string().optional(),
  language: z.enum(['EN', 'AR', 'BOTH']),
  jobAdUrl: z.string().url().optional().or(z.literal('')),
  jobAdText: z.string().optional(),
  notes: z.string().optional(),
}).refine(
  (data) => data.jobAdUrl || data.jobAdText,
  {
    message: "Either job URL or job description text must be provided",
    path: ["jobAdUrl"],
  }
);

type SubmissionFormData = z.infer<typeof submissionSchema>;

export default function NewSubmission() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: storageStatus, isLoading: storageLoading } = useStorageStatus();
  
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [cvFileError, setCvFileError] = useState<string>("");

  // Get orderId from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const orderId = urlParams.get('orderId');

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      roleTarget: "",
      industry: "",
      language: "EN",
      jobAdUrl: "",
      jobAdText: "",
      notes: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // File validation using Supabase helpers
  const validateFile = (file: File | null, required = false): string => {
    // If storage is not available, don't require files
    if (!storageStatus?.available) {
      return "";
    }
    
    if (!file && required) {
      return "CV file is required";
    }
    if (!file) return "";
    
    const validation = validateFileSupabase(file);
    return validation.valid ? "" : validation.error || "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'coverLetter') => {
    console.log('File change event:', event);
    console.log('Files:', event.target.files);
    const file = event.target.files?.[0] || null;
    console.log('Selected file:', file);
    
    if (type === 'cv') {
      console.log('Setting CV file:', file?.name);
      setCvFile(file);
      const error = validateFile(file, true);
      console.log('CV file validation error:', error);
      setCvFileError(error);
    } else {
      console.log('Setting cover letter file:', file?.name);
      setCoverLetterFile(file);
    }
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: SubmissionFormData) => {
      // Validate CV file
      const cvError = validateFile(cvFile, true);
      if (cvError) {
        setCvFileError(cvError);
        throw new Error(cvError);
      }

      // Upload files first
      let cvFileUrl: string | undefined;
      let coverLetterFileUrl: string | undefined;

      if (cvFile || coverLetterFile) {
        const formData = new FormData();
        if (cvFile) {
          formData.append('cv', cvFile);
        }
        if (coverLetterFile) {
          formData.append('coverLetter', coverLetterFile);
        }

        const uploadResponse = await apiRequest("POST", "/api/upload", formData);
        const uploadResult = await uploadResponse.json();

        if (uploadResult.files) {
          cvFileUrl = uploadResult.files.cv ? `/api/files/${uploadResult.files.cv}` : undefined;
          coverLetterFileUrl = uploadResult.files.coverLetter ? `/api/files/${uploadResult.files.coverLetter}` : undefined;
        }
      }

      // Create submission with uploaded file URLs
      const submissionData = {
        ...data,
        orderId,
        cvFileUrl,
        coverLetterFileUrl,
      };

      const response = await apiRequest("POST", API_ENDPOINTS.SUBMISSIONS, submissionData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your submission has been created successfully!",
      });
      
      // Invalidate submissions cache
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.SUBMISSIONS] });
      
      // Navigate to dashboard
      window.location.href = ROUTES.DASHBOARD;
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Submission Error",
        description: error.message || "Failed to create submission. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubmissionFormData) => {
    submitMutation.mutate(data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground" data-testid="text-submission-title">
              New Submission
            </CardTitle>
            <p className="text-muted-foreground" data-testid="text-submission-subtitle">
              Provide your details and upload your current CV to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Role and Industry */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="roleTarget">Target Role *</Label>
                  <Input
                    id="roleTarget"
                    placeholder="e.g., Senior Software Engineer"
                    {...form.register("roleTarget")}
                    data-testid="input-role-target"
                  />
                  {form.formState.errors.roleTarget && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-role-target">
                      {form.formState.errors.roleTarget.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology, Finance, Healthcare"
                    {...form.register("industry")}
                    data-testid="input-industry"
                  />
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <Label>Resume Language *</Label>
                <RadioGroup
                  value={form.watch("language")}
                  onValueChange={(value) => form.setValue("language", value as any)}
                  className="flex space-x-6 mt-2"
                  data-testid="radio-group-language"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EN" id="lang-en" />
                    <Label htmlFor="lang-en">English Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AR" id="lang-ar" />
                    <Label htmlFor="lang-ar">Arabic Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BOTH" id="lang-both" />
                    <Label htmlFor="lang-both">Both Languages</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Job Ad Information */}
              <div className="space-y-4">
                <Label>Job Advertisement *</Label>
                <div>
                  <Label htmlFor="jobAdUrl" className="text-sm text-muted-foreground">Job URL</Label>
                  <Input
                    id="jobAdUrl"
                    type="url"
                    placeholder="https://company.com/jobs/role"
                    {...form.register("jobAdUrl")}
                    data-testid="input-job-url"
                  />
                </div>
                <div className="text-center text-muted-foreground">OR</div>
                <div>
                  <Label htmlFor="jobAdText" className="text-sm text-muted-foreground">Job Description Text</Label>
                  <Textarea
                    id="jobAdText"
                    placeholder="Paste the complete job description here..."
                    rows={6}
                    {...form.register("jobAdText")}
                    data-testid="textarea-job-text"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Please provide either a job URL or paste the job description text
                </p>
                {form.formState.errors.jobAdUrl && (
                  <p className="text-sm text-destructive" data-testid="error-job-info">
                    {form.formState.errors.jobAdUrl.message}
                  </p>
                )}
              </div>

              {/* File Uploads */}
              <div className="space-y-6">
                {/* File upload status warning */}
                {!storageLoading && storageStatus && !storageStatus.available && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.178 2.625-1.516 2.625H3.72c-1.337 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          File Upload Temporarily Unavailable
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>{storageStatus.message}</p>
                          <p className="mt-1">You can still submit your request, but you'll need to provide your files later via email.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CV Upload */}
                <div>
                  <Label>Current CV/Resume {storageStatus?.available ? '*' : '(Optional - upload disabled)'}</Label>
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      storageStatus?.available 
                        ? 'border-border hover:border-primary/50 cursor-pointer' 
                        : 'border-muted-foreground/30 bg-muted/20 cursor-not-allowed'
                    }`}
                    onClick={() => {
                      if (storageStatus?.available) {
                        const fileInput = document.getElementById('cv-file') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.click();
                        }
                      }
                    }}
                    data-testid="dropzone-cv"
                  >
                    <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${
                      storageStatus?.available ? 'text-muted-foreground' : 'text-muted-foreground/50'
                    }`} />
                    <p className={`font-medium mb-2 ${
                      storageStatus?.available ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {!storageStatus?.available ? (
                        "File upload temporarily disabled"
                      ) : cvFile ? (
                        <span className="text-accent">✓ {cvFile.name}</span>
                      ) : (
                        "Drop your CV here or click to browse"
                      )}
                    </p>
                    <p className={`text-sm ${
                      storageStatus?.available ? 'text-muted-foreground' : 'text-muted-foreground/70'
                    }`}>
                      {storageStatus?.available ? 'PDF, DOC, DOCX up to 10MB' : 'Contact support to enable file uploads'}
                    </p>
                    <input
                      id="cv-file"
                      type="file"
                      className="hidden"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'cv')}
                      data-testid="input-cv-file"
                      disabled={!storageStatus?.available}
                    />
                  </div>
                  {cvFileError && (
                    <p className="text-sm text-destructive mt-1" data-testid="error-cv-file">
                      {cvFileError}
                    </p>
                  )}
                </div>

                {/* Cover Letter Upload (Optional) */}
                <div>
                  <Label>Current Cover Letter (Optional)</Label>
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const fileInput = document.getElementById('cover-letter-file') as HTMLInputElement;
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                    data-testid="dropzone-cover-letter"
                  >
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-foreground font-medium mb-2">
                      {coverLetterFile ? (
                        <span className="text-accent">✓ {coverLetterFile.name}</span>
                      ) : (
                        "Drop your cover letter here or click to browse"
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                    <input
                      id="cover-letter-file"
                      type="file"
                      className="hidden"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'coverLetter')}
                      data-testid="input-cover-letter-file"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific requirements, preferences, or information we should know..."
                  rows={4}
                  {...form.register("notes")}
                  data-testid="textarea-notes"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold btn-hover"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-request"
                >
                  {submitMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
