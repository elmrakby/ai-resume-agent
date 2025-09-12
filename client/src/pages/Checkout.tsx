import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, Lock, CreditCard, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS, PACKAGE_PLANS } from "@/lib/constants";
import type { Package, GeoResponse, CheckoutFormData } from "@/lib/types";

// Load Stripe.js dynamically
const loadStripe = async () => {
  if (!(window as any).Stripe) {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = (error) => reject(new Error('Failed to load Stripe.js script'));
    });
  }
  
  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.trim();
  if (!publicKey) {
    throw new Error('Stripe public key not found in environment variables');
  }
  
  if (!publicKey.startsWith('pk_')) {
    console.error('Invalid Stripe key format. Expected pk_test_ or pk_live_, got:', publicKey.substring(0, 8) + '...');
    throw new Error('Invalid Stripe publishable key (expect pk_test_ or pk_live_)');
  }
  
  
  const stripe = (window as any).Stripe(publicKey);
  if (!stripe) {
    throw new Error('Failed to initialize Stripe with public key');
  }
  
  return stripe;
};

export default function Checkout() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // Get plan from URL params and set selected plan
  const [selectedPlan, setSelectedPlan] = useState('STANDARD');
  
  // Update selected plan whenever location changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get('plan')?.toUpperCase();
    
    if (planParam && PACKAGE_PLANS.includes(planParam as any)) {
      setSelectedPlan(planParam);
    } else {
      setSelectedPlan('STANDARD');
    }
  }, [location]);
  
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'paymob'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue with checkout.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = '/api/login';
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Get geo information
  const { data: geoData } = useQuery<GeoResponse>({
    queryKey: [API_ENDPOINTS.GEO],
    retry: false,
  });

  // Get packages with current currency
  const currency = selectedGateway === 'paymob' ? 'EGP' : 'USD';
  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: [API_ENDPOINTS.PACKAGES, currency],
    retry: false,
  });

  // Set gateway based on geo detection
  useEffect(() => {
    if (geoData?.inferredGateway) {
      setSelectedGateway(geoData.inferredGateway);
    }
  }, [geoData]);

  // Get selected package details
  const selectedPackage = packages.find(pkg => pkg.id === selectedPlan);

  // Stripe checkout mutation
  const stripeCheckoutMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // Include client origin URLs to ensure Stripe redirects work
      const requestData = {
        ...data,
        successUrl: `${window.location.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/order/cancel`,
      };
      const response = await apiRequest("POST", API_ENDPOINTS.STRIPE_CHECKOUT, requestData);
      return response.json();
    },
    onSuccess: async (data) => {
      try {
        // For Replit environments, use direct navigation to avoid SecurityError
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        
        // Fallback to Stripe.js method for other environments
        const stripe = await loadStripe();
        if (stripe && data.sessionId) {
          const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
          
          if (result?.error) {
            throw new Error(result.error.message || 'Stripe redirect failed');
          }
        } else {
          const errorMsg = !stripe ? "Unable to initialize Stripe" : "Missing session ID";
          throw new Error(errorMsg);
        }
      } catch (error: any) {
        // If we get a SecurityError (common in iframe/Replit environments), provide manual redirect
        if (error.name === 'SecurityError' || error.message?.includes('permission')) {
          console.log('SecurityError detected, providing manual redirect option...');
          
          // Show user-friendly message with manual redirect option
          toast({
            title: "Payment Redirect Required",
            description: "Due to browser security restrictions, please click the button below to complete your payment.",
            variant: "default",
          });
          
          // Store the official Stripe checkout URL
          setCheckoutUrl(data.url);
          setIsProcessing(false);
          return;
        }
        
        console.error('Stripe redirect error:', error.message);
        toast({
          title: "Payment Error", 
          description: error.message || "Unable to process payment. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Paymob checkout mutation
  const paymobCheckoutMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const response = await apiRequest("POST", API_ENDPOINTS.PAYMOB_CHECKOUT, data);
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Paymob iframe
      if (data.iframeUrl) {
        window.location.href = data.iframeUrl;
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to process checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handlePayment = () => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    
    const checkoutData: CheckoutFormData = {
      plan: selectedPlan,
      gateway: selectedGateway,
      countryCode: geoData?.countryCode || 'US',
    };

    if (selectedGateway === 'stripe') {
      stripeCheckoutMutation.mutate(checkoutData);
    } else {
      paymobCheckoutMutation.mutate(checkoutData);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-checkout-title">
            Complete Your Order
          </h1>
          <p className="text-muted-foreground" data-testid="text-checkout-subtitle">
            Review your selection and complete the payment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Order Summary */}
          <Card data-testid="card-order-summary">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedPackage && (
                <div className="border border-border rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground" data-testid="text-selected-package-name">
                        {selectedPackage.name} Package
                      </h3>
                      {selectedPackage.popular && (
                        <Badge className="mt-1">Most Popular</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground" data-testid="text-selected-package-price">
                        {currency === 'EGP' ? 'EGP' : '$'}{selectedPackage.price}
                      </div>
                      <div className="text-sm text-muted-foreground">{currency}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {selectedPackage.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2" data-testid={`text-feature-${index}`}>
                        <Check className="w-4 h-4 text-accent" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Country Detection */}
              {geoData && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Detected location:</span>
                    <span className="text-sm font-medium text-foreground" data-testid="text-detected-country">
                      {geoData.countryCode === 'EG' ? 'Egypt' : 'International'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card data-testid="card-payment-options">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gateway Selection */}
              <div className="flex space-x-4">
                <Button
                  variant={selectedGateway === 'stripe' ? 'default' : 'outline'}
                  className="flex-1 p-4 h-auto"
                  onClick={() => setSelectedGateway('stripe')}
                  data-testid="button-gateway-stripe"
                >
                  <div className="text-center">
                    <div className="font-semibold">International</div>
                    <div className="text-sm opacity-80">Stripe • Cards • Wallets</div>
                  </div>
                </Button>
                <Button
                  variant={selectedGateway === 'paymob' ? 'default' : 'outline'}
                  className="flex-1 p-4 h-auto"
                  onClick={() => setSelectedGateway('paymob')}
                  data-testid="button-gateway-paymob"
                >
                  <div className="text-center">
                    <div className="font-semibold">Egypt 🇪🇬</div>
                    <div className="text-sm opacity-80">Paymob • Local Cards</div>
                  </div>
                </Button>
              </div>

              {/* Payment Method Info */}
              {selectedGateway === 'stripe' && (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Supported payment methods:
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <span>Digital Wallets</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button
                size="lg"
                className="w-full btn-hover"
                onClick={handlePayment}
                disabled={isProcessing || !selectedPackage}
                data-testid="button-complete-payment"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Complete Payment - ${currency === 'EGP' ? 'EGP' : '$'}${selectedPackage?.price || 0}`
                )}
              </Button>

              {/* Manual Redirect for Replit Environment */}
              {checkoutUrl && (
                <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Complete Your Payment
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Click the button below to open Stripe checkout and complete your payment securely.
                    </p>
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => window.open(checkoutUrl, '_blank')}
                      data-testid="button-manual-stripe-redirect"
                    >
                      Open Stripe Checkout
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Security Notice */}
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure payment powered by Stripe & Paymob</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
