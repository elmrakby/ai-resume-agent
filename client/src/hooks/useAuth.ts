import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Check if we're in an OAuth callback (has code parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthCode = urlParams.has('code');
    
    // If there's an OAuth code, extend loading time to allow Supabase to process it
    if (hasOAuthCode) {
      const timer = setTimeout(() => {
        if (isLoading) {
          // If still loading after 3 seconds, clean up URL and continue
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.toString());
          setIsLoading(false);
        }
      }, 3000);
      
      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    }

    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        await syncUserData(session.user);
        
        // If we had an OAuth code, clean up the URL now that we have a session
        if (hasOAuthCode) {
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          window.history.replaceState({}, '', url.toString());
        }
      }
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          await syncUserData(session.user);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const syncUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Convert Supabase user to our User type
      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || null,
        firstName: supabaseUser.user_metadata?.first_name || 
                  supabaseUser.user_metadata?.full_name?.split(' ')[0] || null,
        lastName: supabaseUser.user_metadata?.last_name || 
                 supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
        profileImageUrl: supabaseUser.user_metadata?.avatar_url || 
                        supabaseUser.user_metadata?.picture || null,
        createdAt: supabaseUser.created_at,
        updatedAt: new Date().toISOString(),
      };

      setUser(userData);

      // Sync with backend if needed (optional - for keeping backend in sync)
      if (supabaseUser.aud === 'authenticated') {
        try {
          const session = await supabase.auth.getSession();
          if (session.data.session?.access_token) {
            await fetch('/api/auth/user', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${session.data.session.access_token}`,
                'Content-Type': 'application/json',
              },
            });
          }
        } catch (error) {
          // Silent fail - backend sync is optional
          console.warn('Failed to sync user with backend:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const getAccessToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  return {
    user,
    supabaseUser,
    isLoading,
    isAuthenticated: !!user && !!supabaseUser,
    signOut,
    getAccessToken,
  };
}
