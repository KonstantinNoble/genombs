import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const IdeasPreview = () => {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 });

  const valueProps = [
    {
      title: "Share Your Ideas",
      description: "Post your business concepts anonymously and get honest feedback from a global community of entrepreneurs and innovators."
    },
    {
      title: "Rate & Discover",
      description: "Discover promising business ideas rated by the community. See what's trending and find inspiration for your next venture."
    },
    {
      title: "Validate Before You Build",
      description: "Get real market feedback before investing time and money. Learn from collective wisdom and refine your concepts."
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className={`py-20 sm:py-28 bg-muted/30 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Business Ideas Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join a thriving community of entrepreneurs sharing, rating, and validating business ideas together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {valueProps.map((prop, index) => (
            <Card 
              key={index}
              className="bg-card border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {prop.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/ideas">
            <Button size="lg" className="px-8">
              Explore All Ideas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default IdeasPreview;
