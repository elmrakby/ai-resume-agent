import { Upload, Sparkles, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload CV + Job Ad",
    description: "Upload your existing CV and the job posting you're targeting. We support PDF and Word formats.",
  },
  {
    icon: Sparkles,
    title: "AI + Expert Polish",
    description: "Our AI analyzes your profile and the job requirements, then our experts refine everything to perfection.",
  },
  {
    icon: CheckCircle,
    title: "Delivery in 48h",
    description: "Receive your ATS-optimized resume, LinkedIn profile, and cover letter ready to land interviews.",
    accent: true,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-how-it-works-subtitle">
            Get your professional resume in just 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center card-hover" data-testid={`card-step-${index + 1}`}>
                <div className={`w-16 h-16 ${step.accent ? 'bg-accent/10' : 'bg-primary/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <Icon className={`w-8 h-8 ${step.accent ? 'text-accent' : 'text-primary'}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4" data-testid={`text-step-${index + 1}-title`}>
                  {step.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-step-${index + 1}-description`}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
