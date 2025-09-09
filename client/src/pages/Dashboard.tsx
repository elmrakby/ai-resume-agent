import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS, ROUTES } from "@/lib/constants";
import { ShoppingCart, FileText, CheckCircle } from "lucide-react";
import type { Order, Submission, DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  // Get orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: [API_ENDPOINTS.ORDERS],
    enabled: isAuthenticated,
    retry: false,
  });

  // Get submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery<Submission[]>({
    queryKey: [API_ENDPOINTS.SUBMISSIONS],
    enabled: isAuthenticated,
    retry: false,
  });

  // Calculate stats
  const stats: DashboardStats = {
    totalOrders: orders.length,
    activeSubmissions: submissions.filter(s => s.status === 'NEW' || s.status === 'IN_PROGRESS').length,
    completed: submissions.filter(s => s.status === 'DELIVERED').length,
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'DELIVERED':
        return 'default';
      case 'PENDING':
      case 'IN_PROGRESS':
        return 'secondary';
      case 'FAILED':
      case 'CANCELED':
        return 'destructive';
      default:
        return 'outline';
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your orders and submissions
            </p>
          </div>
          <Link href={ROUTES.NEW_SUBMISSION}>
            <Button size="lg" className="btn-hover" data-testid="button-new-submission">
              New Submission
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="card-hover" data-testid="card-stat-total-orders">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-stat-total-orders">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="card-stat-active-submissions">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Submissions</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-stat-active-submissions">
                    {stats.activeSubmissions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover" data-testid="card-stat-completed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-stat-completed">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card className="mb-8" data-testid="card-recent-orders">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex space-x-4 p-4">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4" data-testid="text-no-orders">
                  No orders yet. Ready to get started?
                </p>
                <Link href={ROUTES.PRICING}>
                  <Button>Browse Packages</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="table-orders">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Package</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-border" data-testid={`row-order-${order.id}`}>
                        <td className="py-3 px-4 text-sm text-foreground font-mono">
                          #{order.id.slice(-8)}
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground">{order.plan}</td>
                        <td className="py-3 px-4 text-sm text-foreground">
                          {order.currency} {order.amount}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusBadgeVariant(order.status)} data-testid={`badge-order-status-${order.id}`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          {order.status === 'PAID' ? (
                            <Link href={`${ROUTES.NEW_SUBMISSION}?orderId=${order.id}`}>
                              <Button size="sm" variant="outline" data-testid={`button-start-submission-${order.id}`}>
                                Start Submission
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        {submissions.length > 0 && (
          <Card data-testid="card-recent-submissions">
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-4 p-4">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="table-submissions">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Submission ID</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role Target</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Language</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="border-b border-border" data-testid={`row-submission-${submission.id}`}>
                          <td className="py-3 px-4 text-sm text-foreground font-mono">
                            #{submission.id.slice(-8)}
                          </td>
                          <td className="py-3 px-4 text-sm text-foreground">{submission.roleTarget}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{submission.language}</td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusBadgeVariant(submission.status)} data-testid={`badge-submission-status-${submission.id}`}>
                              {submission.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
