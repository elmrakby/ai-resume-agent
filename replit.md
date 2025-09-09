# AI Resume & Career Agent

## Overview

AI Resume & Career Agent is a production-ready web application that provides AI-powered resume and career services for the MENA region. The platform features a comprehensive marketing site with dual payment processing, file upload capabilities, user authentication, and a protected dashboard for order management. The application targets job seekers needing professional resume optimization with support for both English and Arabic languages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses React 18 with TypeScript and Vite as the build tool. The application follows a component-based architecture with shadcn/ui for UI components and Tailwind CSS for styling. Wouter handles client-side routing, while TanStack Query manages server state and API calls. The design implements an Apple-like aesthetic with generous white space, smooth animations via Framer Motion, and responsive layouts supporting both desktop and mobile devices.

### Backend Architecture
The backend is built with Express.js using TypeScript and follows RESTful API conventions. The server implements session-based authentication using Replit Auth with OpenID Connect, supporting both Google and email login. File uploads are prepared for UploadThing integration, while payment processing supports dual gateways (Stripe for international, Paymob for Egyptian customers) with automatic geo-detection.

### Data Storage Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes users, orders, submissions, and sessions tables with proper relationships and enums for status management. Session storage is handled via connect-pg-simple for persistent user sessions.

### Authentication & Authorization
Authentication is implemented using Replit Auth (OpenID Connect) with session-based storage in PostgreSQL. The system supports protected routes with middleware that redirects unauthenticated users to login. User data is automatically synced and updated on each authentication.

### Payment Processing Architecture
The platform implements dual payment processing with automatic geo-detection. Stripe handles international payments in USD with support for Apple Pay and Google Pay, while Paymob processes Egyptian payments in EGP. The system creates orders before payment redirect and updates status via webhook handlers for both gateways.

### File Upload System
File upload functionality is architected for UploadThing integration, supporting PDF and DOCX files up to 10MB. The system validates file types and sizes on both client and server sides, with files organized by user and submission IDs for proper isolation.

### API Design
The API follows RESTful conventions with endpoints for user management, orders, submissions, geo-detection, and payment processing. Error handling includes proper HTTP status codes and JSON responses, with middleware for request logging and authentication validation.

## External Dependencies

### Payment Services
- **Stripe**: International payment processing with support for USD transactions, Apple Pay, and Google Pay
- **Paymob**: Egyptian payment gateway for EGP transactions with local payment methods

### Authentication
- **Replit Auth**: OpenID Connect authentication service providing Google and email login capabilities

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling via @neondatabase/serverless

### File Storage
- **UploadThing**: File upload service for handling CV and cover letter uploads (integration ready)

### UI Components
- **shadcn/ui**: React component library built on Radix UI primitives
- **Radix UI**: Unstyled, accessible UI components for forms, dialogs, and navigation
- **Lucide React**: Icon library for consistent iconography

### Styling & Animation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Framer Motion**: Animation library for smooth page transitions and microinteractions

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL support
- **Zod**: Schema validation for forms and API requests