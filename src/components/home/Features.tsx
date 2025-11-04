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
    <section className="py-16 sm:py-20 md:py-24 bg-background" aria-label="Platform features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 bg-muted border border-border rounded-full text-sm mb-6">
            <span className="text-foreground font-medium">
              Why Wealthconomy
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 px-4 text-foreground">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground px-4">
            AI-powered features designed to accelerate your business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border bg-card hover:shadow-elegant transition-all duration-300 animate-scale-in"
              style={{ 
                animationDelay: `${index * 0.1}s`, 
                animationFillMode: "backwards"
              }}
            >
              <CardContent className="pt-8 pb-8 px-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
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
