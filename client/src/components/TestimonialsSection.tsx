import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";

const testimonials: Testimonial[] = [
  {
    name: "Sarah Ahmed",
    role: "Marketing Manager, Dubai",
    content: "Got 3 interview calls within a week of using my new resume. The ATS optimization really works!",
    initials: "SA",
  },
  {
    name: "Mohamed Khalil",
    role: "Software Engineer, Cairo",
    content: "The bilingual resume service is perfect. Professional Arabic formatting that actually looks good.",
    initials: "MK",
  },
  {
    name: "Layla Hassan",
    role: "Financial Analyst, Riyadh",
    content: "Landed my dream job at a top consulting firm. The LinkedIn rewrite was incredibly effective too.",
    initials: "LH",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-secondary/30 page-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-testimonials-title">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-testimonials-subtitle">
            Success stories from professionals across the MENA region
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover" data-testid={`card-testimonial-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-medium text-muted-foreground" data-testid={`text-testimonial-${index}-initials`}>
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground" data-testid={`text-testimonial-${index}-name`}>
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground" data-testid={`text-testimonial-${index}-role`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground italic mb-4" data-testid={`text-testimonial-${index}-content`}>
                  "{testimonial.content}"
                </p>
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
