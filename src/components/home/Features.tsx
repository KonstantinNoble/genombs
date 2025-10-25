import { TrendingUp, Shield, BarChart3, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: TrendingUp,
    title: "Smart Portfolio Growth",
    description: "Build a diversified portfolio tailored to your financial goals with AI-powered recommendations.",
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Protect your investments with proven risk assessment tools and strategic allocation.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track performance with comprehensive analytics and market insights updated in real-time.",
  },
  {
    icon: Lightbulb,
    title: "Expert Insights",
    description: "Access curated research and expert analysis to make informed investment decisions.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose Wealthconomy?
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful tools and insights to help you make smarter investment decisions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 hover:border-secondary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
