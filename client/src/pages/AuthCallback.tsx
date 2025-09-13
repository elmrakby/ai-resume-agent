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
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to complete authentication.",
            variant: "destructive",
          });
          setLocation("/");
          return;
        }

        if (data.session) {
          toast({
            title: "Welcome!",
            description: "You've successfully signed in.",
          });
          // Redirect to dashboard or home page
          setLocation("/");
        } else {
          // No session found, redirect to home
          setLocation("/");
        }
      } catch (error) {
        console.error("Unexpected error during auth callback:", error);
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