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
        
        // Check if there's a code in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          console.log("AuthCallback: Found OAuth code, exchanging for session...");
          
          // Explicitly exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) {
            console.error("AuthCallback: Code exchange error:", error);
            toast({
              title: "Authentication Error", 
              description: error.message || "Failed to complete authentication.",
              variant: "destructive",
            });
            setLocation("/");
            return;
          }

          if (data.session) {
            console.log("AuthCallback: Session created successfully");
            toast({
              title: "Welcome!",
              description: "You've successfully signed in.",
            });
            
            // Clean up the URL and redirect
            window.history.replaceState({}, '', '/');
            setLocation("/");
          } else {
            console.log("AuthCallback: No session created");
            setLocation("/");
          }
        } else {
          console.log("AuthCallback: No OAuth code found, checking existing session...");
          
          // Fallback: check for existing session
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("AuthCallback: Session check error:", error);
            setLocation("/");
            return;
          }

          if (data.session) {
            console.log("AuthCallback: Existing session found");
            setLocation("/");
          } else {
            console.log("AuthCallback: No session found");
            setLocation("/");
          }
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