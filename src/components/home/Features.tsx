import { Sparkles, Brain, Zap, TrendingUp, Target, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Intelligent business tool recommendations based on your unique needs and goals.",
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description: "Advanced AI analyzes your business context to deliver precision-matched solutions.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Receive comprehensive recommendations in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description: "Tools and strategies tailored to scale your business.",
  },
  {
    icon: Target,
    title: "Precision Matching",
    description: "Industry-specific recommendations that align with your team size and budget.",
  },
  {
    icon: Rocket,
    title: "Free to Start",
    description: "Begin your optimization journey with free daily analysis.",
  },
];

const Features = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-background/50 to-background relative overflow-hidden" aria-label="Platform features">
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16 animate-fade-in-up">
          <div className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full font-semibold text-xs sm:text-sm mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Wealthconomy?
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 px-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Everything You Need to Succeed
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4 leading-relaxed">
            AI-powered features designed to accelerate your business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}
            >
              <CardContent className="pt-8 pb-8 px-6 space-y-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
