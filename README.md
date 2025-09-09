# AI Resume & Career Agent

A production-ready web application for AI-powered resume and career services, featuring dual payment processing, file uploads, and modern React/Express architecture.

## 🚀 Features

### Core Functionality
- **Multi-page Marketing Site**: Hero section, pricing, testimonials, FAQ
- **User Authentication**: Secure login via Replit Auth with Google/email
- **Dual Payment Processing**: 
  - Stripe (USD) for international customers with Apple Pay/Google Pay
  - Paymob (EGP) for Egyptian customers
  - Automatic geo-detection with manual gateway switching
- **File Upload System**: CV/resume uploads (PDF/DOCX up to 10MB)
- **Order Management**: Complete order lifecycle from payment to delivery
- **Dashboard**: Protected user dashboard with order and submission tracking
- **Intake System**: Comprehensive form for job details and file uploads

### Technical Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **Payments**: Stripe API, Paymob integration
- **File Storage**: UploadThing integration ready
- **Validation**: Zod schemas for all forms and API routes

### Design & UX
- **Apple-like Modern Design**: Ultra-clean aesthetic with generous white space
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Accessibility**: AA+ color contrast, focus outlines, aria labels
- **Dark Mode**: Media query-based dark theme support
- **Animations**: Smooth page transitions and microinteractions
- **i18n Ready**: English/Arabic language support with RTL layout

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- PostgreSQL database access
- Stripe account (for international payments)
- Paymob account (for Egyptian payments)
- UploadThing account (for file uploads)

## 🛠️ Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ai-resume-career-agent
npm install
