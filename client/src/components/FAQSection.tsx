import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FAQItem } from "@/lib/types";

const faqItems: FAQItem[] = [
  {
    question: "Are your resumes really ATS-compatible?",
    answer: "Yes, we format all resumes to pass major ATS systems including Workday, Greenhouse, and Lever. We use proper heading structures, standard fonts, and avoid complex graphics that confuse parsers.",
  },
  {
    question: "Do you create Arabic resumes?",
    answer: "Absolutely! We create professional Arabic resumes with proper RTL formatting, cultural context, and region-appropriate language. Perfect for GCC, North Africa, and Levant markets.",
  },
  {
    question: "What if I need revisions?",
    answer: "Standard and Premium packages include revision rounds. We'll refine your resume based on your feedback within 24 hours. Basic package revisions are available for a small additional fee.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Stripe (international cards, Apple Pay, Google Pay) and Paymob for Egyptian customers (local cards, mobile wallets, bank transfers). Payment is automatically optimized based on your location.",
  },
  {
    question: "How is this different from free resume builders?",
    answer: "Free tools use templates that thousands of others use. We create customized resumes tailored to your specific role and industry, with human expert review, ATS optimization, and regional market knowledge that generic tools lack.",
  },
];

export default function FAQSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 page-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="text-faq-title">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-faq-subtitle">
            Everything you need to know about our service
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="overflow-hidden" data-testid={`card-faq-${index}`}>
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between bg-card hover:bg-secondary/50 transition-colors"
                onClick={() => toggleExpanded(index)}
                data-testid={`button-faq-${index}`}
              >
                <span className="font-medium text-foreground" data-testid={`text-faq-${index}-question`}>
                  {item.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              {expandedIndex === index && (
                <CardContent className="px-6 py-4 bg-secondary/30 border-t border-border">
                  <p className="text-muted-foreground" data-testid={`text-faq-${index}-answer`}>
                    {item.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
