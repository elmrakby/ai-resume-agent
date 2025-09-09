import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HeroSection() {
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'AR'>('EN');

  const scrollToPricing = () => {
    const pricingSection = document.querySelector('#pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero-gradient min-h-screen flex items-center page-section animate-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight" data-testid="text-hero-title">
            Land Your Next Job with a Resume That <span className="text-primary">Gets Noticed</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            ATS-optimized resumes, LinkedIn rewrites, and tailored cover letters — delivered in 48 hours. English & Arabic support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold btn-hover"
              onClick={scrollToPricing}
              data-testid="button-get-my-resume"
            >
              Get My Resume
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium btn-hover"
              onClick={scrollToPricing}
              data-testid="button-see-pricing"
            >
              See Pricing
            </Button>
          </div>
          
          {/* Language Toggle */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            <span className="text-sm text-muted-foreground">Available in:</span>
            <Badge
              variant={selectedLanguage === 'EN' ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedLanguage('EN')}
              data-testid="badge-language-en"
            >
              English
            </Badge>
            <Badge
              variant={selectedLanguage === 'AR' ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedLanguage('AR')}
              data-testid="badge-language-ar"
            >
              العربية
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
