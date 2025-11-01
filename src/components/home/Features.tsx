import { Sparkles, Brain, Zap, TrendingUp, Target, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description: "Get intelligent business tool recommendations and strategic insights based on your unique needs and goals.",
    gradient: "from-[hsl(280,85%,65%)] to-[hsl(260,90%,60%)]",
    iconColor: "text-[hsl(280,85%,65%)]"
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description: "Advanced AI analyzes your business context to deliver precision-matched solutions.",
    gradient: "from-[hsl(260,90%,60%)] to-[hsl(240,80%,65%)]",
    iconColor: "text-[hsl(260,90%,60%)]"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Receive comprehensive recommendations in seconds, not hours of research.",
    gradient: "from-[hsl(340,85%,65%)] to-[hsl(320,80%,60%)]",
    iconColor: "text-[hsl(340,85%,65%)]"
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description: "Tools and strategies tailored to scale your business to the next level.",
    gradient: "from-[hsl(160,70%,55%)] to-[hsl(140,75%,50%)]",
    iconColor: "text-[hsl(160,70%,55%)]"
  },
  {
    icon: Target,
    title: "Precision Matching",
    description: "Industry-specific recommendations that align with your team size and budget.",
    gradient: "from-[hsl(300,85%,65%)] to-[hsl(280,85%,65%)]",
    iconColor: "text-[hsl(300,85%,65%)]"
  },
  {
    icon: Rocket,
    title: "Free to Start",
    description: "Begin your optimization journey with free daily analysis—no payment required.",
    gradient: "from-[hsl(200,85%,60%)] to-[hsl(220,80%,65%)]",
    iconColor: "text-[hsl(200,85%,60%)]"
  },
];

const Features = () => {
  return (
    <section className="py-12 sm:py-20 md:py-32 bg-gradient-to-b from-background via-[hsl(260,30%,96%)] to-background relative overflow-hidden" aria-label="Platform features">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(280,85%,65%)]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(340,85%,65%)]/5 rounded-full blur-[100px]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(280,85%,65%,0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(280,85%,65%,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" aria-hidden="true" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-20 animate-fade-in-up">
          <div className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-secondary/15 to-accent/15 border border-secondary/30 rounded-full font-semibold text-xs sm:text-sm mb-6 shadow-[0_0_30px_hsl(280,85%,65%,0.2)] backdrop-blur-sm">
            <span className="bg-gradient-to-r from-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] bg-clip-text text-transparent">
              Why Wealthconomy?
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 px-4">
            <span className="bg-gradient-to-r from-foreground via-[hsl(280,85%,45%)] to-foreground bg-clip-text text-transparent">
              Everything You Need to Succeed
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4 leading-relaxed">
            AI-powered features designed to accelerate your business growth and optimize workflows
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:border-secondary/50 transition-all duration-500 hover:shadow-[0_20px_50px_hsl(280,85%,65%/0.2)] hover:-translate-y-3 group animate-scale-in cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "backwards" }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] duration-1000" />
              
              <CardContent className="pt-8 pb-8 px-6 space-y-4 relative z-10">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg group-hover:shadow-[0_10px_40px_hsl(280,85%,65%/0.3)]`}>
                  <feature.icon className={`h-8 w-8 text-white transition-all duration-500 group-hover:scale-110`} />
                </div>
                <h3 className="text-2xl font-bold group-hover:bg-gradient-to-r group-hover:from-[hsl(280,85%,65%)] group-hover:to-[hsl(340,85%,65%)] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
