import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { FileText, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-welcome-title">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-welcome-subtitle">
            Ready to take the next step in your career?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Quick Start</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Upload your CV and get started with a new submission right away.
              </p>
              <Link href={ROUTES.NEW_SUBMISSION}>
                <Button className="w-full" data-testid="button-new-submission">
                  New Submission
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-accent" />
                <span>View Dashboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track your orders and submissions in one place.
              </p>
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="outline" className="w-full" data-testid="button-dashboard">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span>Browse Packages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore our service packages and pricing options.
              </p>
              <Link href={ROUTES.PRICING}>
                <Button variant="outline" className="w-full" data-testid="button-pricing">
                  View Pricing
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you succeed. Check out our FAQ or get in touch.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' })}>
              View FAQ
            </Button>
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
