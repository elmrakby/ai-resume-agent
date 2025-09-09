export const ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  CHECKOUT: '/checkout',
  DASHBOARD: '/dashboard',
  NEW_SUBMISSION: '/dashboard/new-submission',
  ORDER_SUCCESS: '/order/success',
  ORDER_CANCEL: '/order/cancel',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const;

export const LANGUAGES = {
  EN: 'English',
  AR: 'العربية',
} as const;

export const PACKAGE_PLANS = ['BASIC', 'STANDARD', 'PREMIUM'] as const;

export const API_ENDPOINTS = {
  GEO: '/api/geo',
  PACKAGES: '/api/packages',
  ORDERS: '/api/orders',
  SUBMISSIONS: '/api/submissions',
  STRIPE_CHECKOUT: '/api/stripe/checkout',
  PAYMOB_CHECKOUT: '/api/paymob/checkout',
  AUTH_USER: '/api/auth/user',
} as const;
