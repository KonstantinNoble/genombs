import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "AI-Powered Insights",
    description: "Intelligent business tool recommendations based on your unique needs and goals.",
  },
  {
    title: "Smart Analysis",
    description: "Advanced AI analyzes your business context to deliver precision-matched solutions.",
  },
  {
    title: "Instant Results",
    description: "Receive comprehensive recommendations in seconds.",
  },
  {
    title: "Growth Focused",
    description: "Tools and strategies tailored to scale your business.",
  },
  {
    title: "Precision Matching",
    description: "Industry-specific recommendations that align with your team size and budget.",
  },
  {
    title: "Free to Start",
    description: "Begin your optimization journey with free daily analysis.",
  },
];

const Features = () => {
  return (
    <section
      className="py-20 sm:py-24 md:py-32 bg-background"
      aria-label="Features section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Why Choose Our Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make informed decisions with AI-powered insights tailored to your business needs.
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
