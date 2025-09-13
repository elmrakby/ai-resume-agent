import type { Express, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabase";
import { storage } from "./storage";

// User interface for authenticated requests
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Extended request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Middleware to verify JWT token from Supabase - make optional for public routes
export async function verifySupabaseToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For optional auth middleware, continue without user
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      // For optional auth middleware, continue without user
      return next();
    }

    // Get or create user in our storage
    await storage.upsertUser({
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
      lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '',
      lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
      profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    };

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    // For optional auth middleware, continue without user
    next();
  }
}

// Middleware for routes that require authentication
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Setup minimal auth routes for Supabase integration
export function setupSupabaseAuth(app: Express) {
  // Health check endpoint
  app.get('/api/auth/health', (req, res) => {
    res.json({ status: 'ok', provider: 'supabase' });
  });

  // Note: User data syncing is handled automatically by the verifySupabaseToken middleware
  // No webhook endpoint needed since we sync users on each authenticated request
}