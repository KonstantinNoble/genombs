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
      "Choose between quick standard analysis or comprehensive deep analysis with ROI calculations and risk assessments.",
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
      className="py-20 sm:py-24 md:py-32 bg-background/60 sm:bg-background/40 sm:backdrop-blur-sm"
      aria-label="Features section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
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
              className="p-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 border-border bg-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-all duration-500">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
