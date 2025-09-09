import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function OrderCancel() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground" data-testid="text-cancel-title">
              Payment Canceled
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground" data-testid="text-cancel-message">
              Your payment was canceled. No charges have been made to your account.
            </p>
            
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Want to try again?</h3>
              <p className="text-muted-foreground">
                You can return to our pricing page to select a package or contact our support team if you need assistance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.PRICING}>
                <Button size="lg" className="btn-hover" data-testid="button-retry-payment">
                  Try Again
                </Button>
              </Link>
              <Link href={ROUTES.HOME}>
                <Button variant="outline" size="lg" className="btn-hover" data-testid="button-back-home">
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Need help? <a href="mailto:support@airesume.com" className="text-primary hover:underline">Contact Support</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
