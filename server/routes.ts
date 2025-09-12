import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertOrderSchema, insertSubmissionSchema, PACKAGE_CONFIG } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found. Stripe payments will not work.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
}) : null;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueId}${ext}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Geo-detection API
  app.get('/api/geo', (req, res) => {
    // Simple geo-detection based on headers
    const countryCode = req.headers['cf-ipcountry'] as string || 
                       req.headers['x-country-code'] as string || 
                       'US';
    
    const inferredGateway = countryCode === 'EG' ? 'paymob' : 'stripe';
    
    res.json({
      countryCode,
      inferredGateway,
      ip: req.ip || req.connection.remoteAddress
    });
  });

  // File upload endpoint
  app.post('/api/upload', isAuthenticated, upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 }
  ]), (req: any, res) => {
    try {
      const uploadedFiles: { cv?: string; coverLetter?: string } = {};
      
      if (req.files) {
        if (req.files.cv && req.files.cv[0]) {
          uploadedFiles.cv = req.files.cv[0].filename;
        }
        if (req.files.coverLetter && req.files.coverLetter[0]) {
          uploadedFiles.coverLetter = req.files.coverLetter[0].filename;
        }
      }
      
      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'File upload failed: ' + error.message });
    }
  });

  // File serving endpoint
  app.get('/api/files/:filename', isAuthenticated, async (req: any, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    const userId = req.user.claims.sub;
    
    // Security check - ensure file exists and is within uploads directory
    if (!fs.existsSync(filepath) || !filepath.startsWith(uploadsDir)) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    try {
      // Check if user owns this file by looking at submissions
      const userSubmissions = await storage.getUserSubmissions(userId);
      const ownsFile = userSubmissions.some(submission => 
        submission.cvFileUrl?.includes(filename) || 
        submission.coverLetterFileUrl?.includes(filename)
      );
      
      if (!ownsFile) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.sendFile(filepath);
    } catch (error) {
      console.error('Error checking file ownership:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Package pricing API
  app.get('/api/packages/:currency', (req, res) => {
    const { currency = 'USD' } = req.params;
    
    const packages = Object.entries(PACKAGE_CONFIG).map(([key, config]) => ({
      id: key,
      name: config.name,
      price: currency === 'EGP' ? config.priceEGP : config.priceUSD,
      currency: currency as string,
      features: config.features,
      popular: 'popular' in config ? config.popular : false
    }));
    
    res.json(packages);
  });

  // Stripe checkout
  app.post('/api/stripe/checkout', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    try {
      const { plan, successUrl, cancelUrl } = req.body;
      const userId = req.user.claims.sub;

      // Validate plan
      if (!PACKAGE_CONFIG[plan as keyof typeof PACKAGE_CONFIG]) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      const packageConfig = PACKAGE_CONFIG[plan as keyof typeof PACKAGE_CONFIG];

      // Create order record
      const order = await storage.createOrder({
        userId,
        plan,
        amount: packageConfig.priceUSD.toString(),
        currency: 'USD',
        gateway: 'STRIPE',
        status: 'PENDING',
        countryCode: req.body.countryCode || 'US',
        ip: req.ip
      });

      // Get the correct base URL from request headers
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      let host = req.headers.host || 'localhost:5000';
      
      // Normalize Replit host: remove per-instance segment like "-00-pebjqi0c7ux9" 
      // This ensures Stripe redirects work even after server restarts/hot reloads
      host = host.replace(/-\d{2}-[a-z0-9]+(\.)/i, '$1');
      
      const baseUrl = `${protocol}://${host}`;
      
      console.log('Stripe checkout URLs - Base URL (normalized):', baseUrl);

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: successUrl || `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${baseUrl}/order/cancel`,
        metadata: {
          orderId: order.id,
          userId,
          plan
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${packageConfig.name} Package`,
                description: packageConfig.features.join(', ')
              },
              unit_amount: packageConfig.priceUSD * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
      });

      // Update order with session ID
      await storage.updateOrderStatus(order.id, 'PENDING', session.id);

      res.json({ 
        sessionId: session.id,
        orderId: order.id 
      });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ message: 'Error creating checkout session: ' + error.message });
    }
  });

  // Stripe webhook
  app.post('/api/stripe/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return res.status(500).json({ message: 'Webhook secret not configured' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await storage.updateOrderStatus(orderId, 'PAID', session.id);
          console.log(`Order ${orderId} marked as PAID`);
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Paymob checkout (stub implementation)
  app.post('/api/paymob/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.user.claims.sub;

      // Validate plan
      if (!PACKAGE_CONFIG[plan as keyof typeof PACKAGE_CONFIG]) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      const packageConfig = PACKAGE_CONFIG[plan as keyof typeof PACKAGE_CONFIG];

      // Create order record
      const order = await storage.createOrder({
        userId,
        plan,
        amount: packageConfig.priceEGP.toString(),
        currency: 'EGP',
        gateway: 'PAYMOB',
        status: 'PENDING',
        countryCode: 'EG',
        ip: req.ip
      });

      // TODO: Implement Paymob integration
      // For now, return mock response
      res.json({ 
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID || 'mock'}?payment_token=mock_token`,
        orderId: order.id 
      });
    } catch (error: any) {
      console.error('Paymob checkout error:', error);
      res.status(500).json({ message: 'Error creating checkout: ' + error.message });
    }
  });

  // Paymob webhook (stub implementation)
  app.post('/api/paymob/webhook', async (req, res) => {
    try {
      // TODO: Implement Paymob webhook verification and processing
      console.log('Paymob webhook received:', req.body);
      res.json({ received: true });
    } catch (error) {
      console.error('Paymob webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  // Orders API
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const order = await storage.getOrder(id);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Failed to fetch order' });
    }
  });

  // Submissions API
  app.get('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissions = await storage.getUserSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  });

  app.post('/api/submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSubmissionSchema.parse({
        ...req.body,
        userId
      });

      const submission = await storage.createSubmission(validatedData);
      res.status(201).json(submission);
    } catch (error: any) {
      console.error('Error creating submission:', error);
      if (error.name === 'ZodError') {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create submission' });
      }
    }
  });

  app.get('/api/submissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const submission = await storage.getSubmission(id);
      if (!submission || submission.userId !== userId) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      res.json(submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({ message: 'Failed to fetch submission' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
