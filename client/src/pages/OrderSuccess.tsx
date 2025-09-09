import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function OrderSuccess() {
  const [location] = useLocation();
  
  // Get session_id from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const sessionId = urlParams.get('session_id');

  useEffect(() => {
    // TODO: Verify payment with session_id if needed
    console.log('Payment successful, session_id:', sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground" data-testid="text-success-title">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground" data-testid="text-success-message">
              Thank you for your purchase! Your payment has been processed successfully.
            </p>
            
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">What's Next?</h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• You'll receive a confirmation email shortly</li>
                <li>• Click the button below to start your submission</li>
                <li>• Upload your CV and job details</li>
                <li>• Receive your optimized resume in 48 hours</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.NEW_SUBMISSION}>
                <Button size="lg" className="btn-hover" data-testid="button-start-submission">
                  Start Submission
                </Button>
              </Link>
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="outline" size="lg" className="btn-hover" data-testid="button-view-dashboard">
                  View Dashboard
                </Button>
              </Link>
            </div>

            {sessionId && (
              <p className="text-xs text-muted-foreground mt-4">
                Order reference: {sessionId.slice(-12)}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
