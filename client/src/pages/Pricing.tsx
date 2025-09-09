import Navigation from "@/components/Navigation";
import PackagesSection from "@/components/PackagesSection";
import Footer from "@/components/Footer";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="text-pricing-page-title">
              Choose Your Package
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-pricing-page-subtitle">
              Professional resume services designed to help you land your dream job. Choose the package that best fits your needs.
            </p>
          </div>
        </div>
        <PackagesSection />
      </main>
      <Footer />
    </div>
  );
}
