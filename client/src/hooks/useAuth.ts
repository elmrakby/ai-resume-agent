import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        console.log('useAuth: getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('useAuth: getSession error:', error);
        }
        
        console.log('useAuth: session result:', session?.user?.id || 'no session');
        
        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          await syncUserData(session.user);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('useAuth: session error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (session?.user && mounted) {
          setSupabaseUser(session.user);
          await syncUserData(session.user);
        } else if (mounted) {
          setSupabaseUser(null);
          setUser(null);
        }
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
