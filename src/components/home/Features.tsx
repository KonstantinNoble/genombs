import { Sparkles, Brain, Zap, TrendingUp, Target, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get intelligent business tool recommendations based on your unique needs and goals.",
    gradient: "from-secondary/20 to-secondary/5"
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description: "Advanced AI analyzes your business context to deliver precision-matched solutions.",
    gradient: "from-[hsl(260,60%,60%)]/20 to-[hsl(260,60%,60%)]/5"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Receive comprehensive recommendations in seconds, not hours of research.",
    gradient: "from-[hsl(30,100%,60%)]/20 to-[hsl(30,100%,60%)]/5"
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description: "Tools and strategies tailored to scale your business to the next level.",
    gradient: "from-[hsl(140,70%,50%)]/20 to-[hsl(140,70%,50%)]/5"
  },
  {
    icon: Target,
    title: "Precision Matching",
    description: "Industry-specific recommendations that align with your team size and budget.",
    gradient: "from-[hsl(340,85%,65%)]/20 to-[hsl(340,85%,65%)]/5"
  },
  {
    icon: Rocket,
    title: "Free to Start",
    description: "Begin your optimization journey with free daily analysis—no payment required.",
    gradient: "from-[hsl(200,80%,60%)]/20 to-[hsl(200,80%,60%)]/5"
  },
];

const Features = () => {
  return (
    <section className="py-12 sm:py-20 md:py-32 bg-gradient-to-b from-background via-[hsl(220,35%,96%)] to-background relative overflow-hidden" aria-label="Platform features">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(220,70%,15%,0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220,70%,15%,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" aria-hidden="true" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-20 animate-fade-in-up">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 border border-secondary/30 rounded-full text-secondary font-medium text-xs sm:text-sm mb-4 sm:mb-6">
            Why Wealthconomy?
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text px-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            Powerful features designed to accelerate your business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border bg-card/50 backdrop-blur-sm hover:border-secondary/40 transition-all duration-500 hover:shadow-[0_8px_30px_hsl(45,98%,58%/0.12)] hover:-translate-y-2 md:hover:-translate-y-3 group animate-scale-in cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 from-secondary/5 to-transparent" />
              <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-4 sm:px-6 space-y-3 sm:space-y-4 relative z-10">
                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg`}>
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 text-foreground transition-all duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold group-hover:text-secondary transition-colors duration-300">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
