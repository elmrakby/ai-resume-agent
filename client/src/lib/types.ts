export interface GeoResponse {
  countryCode: string;
  inferredGateway: 'stripe' | 'paymob';
  ip?: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  popular?: boolean;
}

export interface CheckoutFormData {
  plan: string;
  gateway: 'stripe' | 'paymob';
  successUrl?: string;
  cancelUrl?: string;
  countryCode: string;
}

export interface SubmissionFormData {
  roleTarget: string;
  industry?: string;
  language: 'EN' | 'AR' | 'BOTH';
  jobAdUrl?: string;
  jobAdText?: string;
  notes?: string;
  cvFile?: File;
  coverLetterFile?: File;
}

export interface DashboardStats {
  totalOrders: number;
  activeSubmissions: number;
  completed: number;
}

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  initials: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Order {
  id: string;
  userId: string;
  plan: string;
  amount: string;
  currency: string;
  gateway: string;
  status: string;
  externalId?: string | null;
  countryCode?: string | null;
  ip?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  orderId?: string | null;
  roleTarget: string;
  industry?: string | null;
  language: 'EN' | 'AR' | 'BOTH';
  jobAdUrl?: string | null;
  jobAdText?: string | null;
  notes?: string | null;
  cvFileUrl?: string | null;
  coverLetterFileUrl?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'QA' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
