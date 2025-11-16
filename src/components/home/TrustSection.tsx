import { Card } from "@/components/ui/card";
import { Shield, Zap, Target, TrendingUp } from "lucide-react";

const trustPoints = [
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Privacy First",
    description: "Your website data and analysis results are private and secure. We never share your information with third parties."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Powered by Advanced AI",
    description: "Built on Google Gemini 2.5 Flash, delivering cutting-edge analysis with fast response times and accurate recommendations."
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Website-Specific Results",
    description: "Unlike generic advice, our AI analyzes your exact website type, status, goals, and budget to deliver truly personalized recommendations."
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "ROI-Focused Advice",
    description: "Every premium recommendation includes expected return on investment, risk levels, and realistic timelines - no fluff, just actionable strategies."
  }
];

const stats = [
  { value: "2,500+", label: "Analyses Delivered" },
  { value: "95%", label: "User Satisfaction" },
  { value: "24/7", label: "AI Availability" },
  { value: "Free", label: "to Start" }
];

const TrustSection = () => {
  return (
    <section className="py-20 sm:py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 animate-fade-in">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Points */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-4 animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Why Choose Synoptas?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by website owners and businesses worldwide for reliable, actionable AI insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {trustPoints.map((point, index) => (
              <Card
                key={index}
                className="p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 border-border bg-card group animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 group-hover:scale-110 transition-transform duration-500">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-all duration-500">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
