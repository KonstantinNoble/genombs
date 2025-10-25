import { Sparkles, Brain, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Suggestions",
    description: "Get personalized stock recommendations based on your unique investment profile and risk tolerance.",
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description: "Advanced AI models analyze market trends and generate insights tailored to your goals.",
  },
  {
    icon: BookOpen,
    title: "Educational Blog",
    description: "Learn investment strategies, market analysis, and financial literacy through our expert articles.",
  },
  {
    icon: Clock,
    title: "Daily Free Analysis",
    description: "Receive one free AI-powered stock analysis every 24 hours to guide your investment decisions.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background via-[hsl(220,35%,96%)] to-background relative overflow-hidden" aria-label="Platform features">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220,70%,15%,0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220,70%,15%,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" aria-hidden="true" />
      <div className="container relative mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
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
              className="border-border bg-card hover:border-secondary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-2 group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}
            >
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                  <feature.icon className="h-6 w-6 text-secondary transition-transform duration-300 group-hover:rotate-6" />
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
