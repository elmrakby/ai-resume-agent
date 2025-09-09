import { Link } from "wouter";
import { Zap } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const footerSections = [
  {
    title: "Services",
    links: [
      { label: "Resume Writing", href: "#" },
      { label: "LinkedIn Optimization", href: "#" },
      { label: "Cover Letters", href: "#" },
      { label: "Interview Prep", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: ROUTES.PRIVACY },
      { label: "Terms of Service", href: ROUTES.TERMS },
      { label: "Refund Policy", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">AI Resume</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md" data-testid="text-footer-description">
              Professional resume and career services for the MENA region. Land your dream job with expert-crafted, ATS-optimized resumes.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Available in:</span>
              <span className="text-sm text-foreground">English</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-foreground">العربية</span>
            </div>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4" data-testid={`text-footer-section-${index}-title`}>
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href} className="hover:text-foreground transition-colors" data-testid={`link-footer-${index}-${linkIndex}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
              © 2024 AI Resume & Career Agent. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Secure payments by</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">Stripe</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm font-medium text-foreground">Paymob</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
