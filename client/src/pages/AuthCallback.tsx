import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Processing OAuth callback...");
        console.log("AuthCallback: Current URL:", window.location.href);
        
        // Wait a moment for Supabase to process the session from URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check for session after Supabase processes the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthCallback: Session error:", error);
          toast({
            title: "Authentication Error", 
            description: error.message || "Failed to complete authentication.",
            variant: "destructive",
          });
          setLocation("/");
          return;
        }

        if (data.session?.user) {
          console.log("AuthCallback: Session found for user:", data.session.user.id);
          toast({
            title: "Welcome!",
            description: "You've successfully signed in.",
          });
          
          // Clean up the URL and redirect
          window.history.replaceState({}, '', '/');
          setLocation("/");
        } else {
          console.log("AuthCallback: No session found, redirecting to home");
          
          // Check URL params for any error information
          const urlParams = new URLSearchParams(window.location.search);
          const errorCode = urlParams.get('error_code');
          const errorDescription = urlParams.get('error_description');
          
          if (errorCode) {
            console.error("AuthCallback: OAuth error:", errorCode, errorDescription);
            toast({
              title: "Authentication Error",
              description: errorDescription || "Authentication failed.",
              variant: "destructive",
            });
          }
          
          setLocation("/");
        }
      } catch (error) {
        console.error("AuthCallback: Unexpected error:", error);
        toast({
          title: "Authentication Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        setLocation("/");
      }
    };

    handleAuthCallback();
  }, [setLocation, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}