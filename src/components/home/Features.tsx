import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Website Tool Recommendations",
    description: "AI-powered analysis of your website with tailored tool suggestions for optimization.",
  },
  {
    title: "Website Business Ideas",
    description: "Innovative business models and monetization strategies specifically for your website.",
  },
  {
    title: "Screenshot Analysis",
    description: "Upload screenshots of your website - AI analyzes design, structure, and optimization potential.",
  },
  {
    title: "Website Type Specific",
    description: "Recommendations based on your website type - E-commerce, Blog, SaaS, Portfolio, and more.",
  },
  {
    title: "Budget Oriented",
    description: "Tool and idea suggestions matching your monthly budget and website status.",
  },
  {
    title: "Instant Results",
    description: "Detailed analysis with concrete action recommendations in seconds.",
  },
];

const Features = () => {
  return (
    <section
      className="py-20 sm:py-24 md:py-32 bg-background/70 backdrop-blur-sm"
      aria-label="Features section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Your AI Website Advisor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Two powerful AI features: Find the perfect tools for your website and discover profitable business ideas - all based on your website screenshots and goals.
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
