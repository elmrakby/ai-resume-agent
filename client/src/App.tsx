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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - always available */}
      <Route path={ROUTES.CHECKOUT} component={Checkout} />
      <Route path={ROUTES.ORDER_SUCCESS} component={OrderSuccess} />
      <Route path={ROUTES.ORDER_CANCEL} component={OrderCancel} />
      
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
