import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { ROUTES, API_ENDPOINTS } from "@/lib/constants";
import type { Package, GeoResponse } from "@/lib/types";

export default function PackagesSection() {
  const [currency, setCurrency] = useState<'USD' | 'EGP'>('USD');

  // Get geo information
  const { data: geoData } = useQuery<GeoResponse>({
    queryKey: [API_ENDPOINTS.GEO],
    retry: false,
  });

  // Get packages
  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: [API_ENDPOINTS.PACKAGES, currency],
    retry: false,
  });

  // Set currency based on geo detection
  useEffect(() => {
    if (geoData?.countryCode === 'EG') {
      setCurrency('EGP');
    }
  }, [geoData]);

  if (isLoading) {
    return (
      <section id="pricing" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Choose Your Package</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Professional resume services tailored to your career goals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-muted rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-packages-title">
            Choose Your Package
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-packages-subtitle">
            Professional resume services tailored to your career goals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`card-hover relative ${pkg.popular ? 'border-2 border-primary' : ''}`}
              data-testid={`card-package-${pkg.id.toLowerCase()}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-2" data-testid="badge-most-popular">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`text-package-${pkg.id.toLowerCase()}-name`}>
                  {pkg.name}
                </h3>
                <div className="text-3xl font-bold text-foreground mb-1" data-testid={`text-package-${pkg.id.toLowerCase()}-price`}>
                  {currency === 'EGP' ? 'EGP' : '$'}{pkg.price}
                </div>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3" data-testid={`text-package-${pkg.id.toLowerCase()}-feature-${index}`}>
                      <Check className="w-5 h-5 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`${ROUTES.CHECKOUT}?plan=${pkg.id.toLowerCase()}`}>
                  <Button 
                    className="w-full btn-hover font-medium" 
                    size="lg"
                    data-testid={`button-choose-${pkg.id.toLowerCase()}`}
                  >
                    Choose {pkg.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Geo-Payment Info */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground" data-testid="text-payment-info">
            🇪🇬 Egyptian customers: Prices shown in EGP at checkout | 🌍 International: USD pricing
          </p>
        </div>
      </div>
    </section>
  );
}
