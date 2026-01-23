import { Card } from "@/components/ui/card";
import { Shield, FileCheck, Clock } from "lucide-react";

const trustPoints = [
  {
    title: "Privacy First",
    description: "Your decision context stays private. Encrypted in transit and at rest. Never shared with third parties. Delete anytime.",
    icon: Shield
  },
  {
    title: "Audit-Grade Documentation",
    description: "Every perspective timestamped and traceable. Exportable PDFs ready for boards, investors, and regulators.",
    icon: FileCheck
  },
  {
    title: "Ready in Seconds",
    description: "From question to documented decision record in under 60 seconds. No lengthy onboarding. No complex setup.",
    icon: Clock
  }
];

const TrustSection = () => {
  return (
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-muted/30 to-primary/10 animate-fade-in" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--primary-rgb),0.08),transparent_50%)]" />
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-muted/40 to-transparent pointer-events-none z-[1]" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/40 to-transparent pointer-events-none z-[1]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Points */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Built for Trust
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed for professionals who need defensible decision documentation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {trustPoints.map((point, index) => {
              const IconComponent = point.icon;
              return (
                <Card
                  key={index}
                  className="p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur-sm group animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Animated Border Gradient on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent transition-all duration-500 rounded-lg" />
                  
                  <div className="relative z-10">
                    <div className="mb-4 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-all duration-500">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;