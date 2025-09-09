import { Globe, Languages, Clock, ShieldCheck, DollarSign, Users } from "lucide-react";

const benefits = [
  {
    icon: Globe,
    title: "MENA-Focused",
    description: "Specialized knowledge of Middle East and North Africa job markets",
  },
  {
    icon: Languages,
    title: "Bilingual Support",
    description: "Professional resumes in both English and Arabic with proper formatting",
  },
  {
    icon: Clock,
    title: "48h Turnaround",
    description: "Fast delivery without compromising on quality or attention to detail",
    accent: true,
  },
  {
    icon: ShieldCheck,
    title: "ATS-Optimized",
    description: "Resumes designed to pass Applicant Tracking Systems used by major companies",
  },
  {
    icon: DollarSign,
    title: "Affordable",
    description: "Professional service at competitive prices with local payment options",
    accent: true,
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "HR professionals and career experts with regional industry knowledge",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="py-24 page-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-why-choose-title">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-why-choose-subtitle">
            We understand the MENA job market and deliver results
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center" data-testid={`card-benefit-${index}`}>
                <div className={`w-12 h-12 ${benefit.accent ? 'bg-accent/10' : 'bg-primary/10'} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${benefit.accent ? 'text-accent' : 'text-primary'}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2" data-testid={`text-benefit-${index}-title`}>
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-benefit-${index}-description`}>
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
