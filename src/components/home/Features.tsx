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
    <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden" aria-label="Platform features" style={{ background: "var(--gradient-subtle)" }}>
      {/* Subtle decorative elements */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20 rounded-full text-sm mb-6">
            <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent font-semibold">
              Why Wealthconomy
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-4">
            <span className="bg-gradient-to-r from-foreground via-secondary/80 to-foreground bg-clip-text text-transparent">
              Everything You Need to Succeed
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground px-4">
            AI-powered features designed to accelerate your business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border/40 bg-card/60 backdrop-blur-sm hover:border-secondary/30 transition-all duration-500 hover:-translate-y-2 animate-scale-in relative overflow-hidden"
              style={{ 
                animationDelay: `${index * 0.1}s`, 
                animationFillMode: "backwards",
                boxShadow: "var(--shadow-elegant)"
              }}
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="relative pt-8 pb-8 px-6 space-y-4">
                <div 
                  className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-secondary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
