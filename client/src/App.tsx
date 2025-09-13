import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import Checkout from "@/pages/Checkout";
import Dashboard from "@/pages/Dashboard";
import NewSubmission from "@/pages/NewSubmission";
import OrderSuccess from "@/pages/OrderSuccess";
import OrderCancel from "@/pages/OrderCancel";
import AuthCallback from "@/pages/AuthCallback";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Check if we're processing an OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthCode = urlParams.has('code');

  // Show loading state during OAuth processing
  if (hasOAuthCode && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes - always available */}
      <Route path={ROUTES.CHECKOUT} component={Checkout} />
      <Route path={ROUTES.ORDER_SUCCESS} component={OrderSuccess} />
      <Route path={ROUTES.ORDER_CANCEL} component={OrderCancel} />
      <Route path="/auth/callback" component={AuthCallback} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path={ROUTES.HOME} component={Landing} />
          <Route path={ROUTES.PRICING} component={Pricing} />
        </>
      ) : (
        <>
          <Route path={ROUTES.HOME} component={Home} />
          <Route path={ROUTES.PRICING} component={Pricing} />
          <Route path={ROUTES.DASHBOARD} component={Dashboard} />
          <Route path={ROUTES.NEW_SUBMISSION} component={NewSubmission} />
        </>
      )}
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
