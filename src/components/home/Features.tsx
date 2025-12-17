import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Real-Time Market Research",
    description:
      "Every strategy is backed by live web research. Our AI analyzes 10-20+ current sources including market trends, competitor data, and industry insights.",
  },
  {
    title: "AI Business Planner",
    description:
      "Describe your business goals and get a phased strategy with actionable steps powered by real-time data.",
  },
  {
    title: "AI Autopilot",
    description:
      "Get 3 AI-generated daily focus tasks tailored to your active strategy. Stay on track with personalized action items and streak tracking.",
  },
  {
    title: "Deep Analysis Mode",
    description:
      "Premium users get comprehensive phases with competitor analysis, ROI projections, and weekly action plans.",
  },
];

const Features = () => {
  return (
    <section
      className="py-20 sm:py-24 md:py-32 relative overflow-hidden"
      aria-label="Features section"
    >
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto]">
            AI-Powered Business Strategy
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Turn your business goals into actionable, phased strategies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-border/50 bg-card/80 backdrop-blur-sm group animate-fade-in relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-transparent transition-all duration-500 rounded-lg" />
              
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-all duration-500 flex items-center gap-2">
                  {feature.title}
                  <span className="inline-block w-0 group-hover:w-2 h-2 bg-primary rounded-full transition-all duration-500" />
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
