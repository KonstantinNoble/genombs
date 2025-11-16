import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "AI-Powered Tool Discovery",
    description:
      "Get personalized recommendations for analytics, SEO, performance, and marketing tools based on your website type and budget.",
  },
  {
    title: "Strategic Improvement Ideas",
    description:
      "Discover actionable strategies to grow your website. Focus on revenue, efficiency, customer experience, and market expansion.",
  },
  {
    title: "Budget-Friendly Recommendations",
    description:
      "Whether you're starting out or scaling up, get tool and strategy suggestions that fit your monthly budget.",
  },
  {
    title: "Website Type Specific",
    description:
      "Tailored advice for E-commerce, SaaS, Blogs, Portfolios, and more. AI understands your business model.",
  },
  {
    title: "Standard & Deep Analysis",
    description:
      "Choose between quick standard analysis or comprehensive deep analysis with ROI calculations, risk assessments, and custom requirements input.",
  },
  {
    title: "Actionable Reports",
    description:
      "No fluff, just concrete action steps. Premium users get detailed PDF reports with implementation timelines.",
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
            Everything You Need to Optimize Your Website
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI analysis for your website optimization needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
