import { Button } from "@/components/ui/button";

export default function CTASection() {
  const scrollToPricing = () => {
    const pricingSection = document.querySelector('#pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="text-cta-title">
          Ready to Land Your Dream Job?
        </h2>
        <p className="text-xl mb-8 text-primary-foreground/80" data-testid="text-cta-subtitle">
          Join thousands of professionals who've accelerated their careers with our service
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="px-8 py-4 text-lg font-semibold btn-hover"
          onClick={scrollToPricing}
          data-testid="button-get-started-today"
        >
          Get Started Today
        </Button>
      </div>
    </section>
  );
}
