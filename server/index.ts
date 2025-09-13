import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { initializeStorage } from "./supabase";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Log all requests (not just /api) to debug OAuth flow
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (req.query && Object.keys(req.query).length > 0) {
      logLine += ` query=${JSON.stringify(req.query)}`;
    }
    if (capturedJsonResponse && path.startsWith("/api")) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 200) {
      logLine = logLine.slice(0, 199) + "…";
    }

    log(logLine);
  });

  next();
});

(async () => {
  // Initialize Supabase storage (gracefully handle errors)
  try {
    await initializeStorage();
  } catch (error) {
    console.warn('Storage initialization failed, continuing without storage:', error.message);
  }
  
  // Handle OAuth callbacks that land on root path
  app.get('/', (req, res, next) => {
    const hasOAuthParams = req.query.code || req.query.error || req.query.error_code;
    console.log(`[OAuth Debug] Root request: ${req.url}, hasOAuthParams: ${!!hasOAuthParams}`);
    if (hasOAuthParams) {
      const qs = new URLSearchParams(req.query as Record<string, string>).toString();
      const redirectUrl = `/auth/callback${qs ? `?${qs}` : ''}`;
      console.log(`[OAuth Debug] Redirecting to: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    }
    return next();
  });
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
