import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BlogCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background/40 backdrop-blur-sm relative overflow-hidden">
      {/* Top fade transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />
      {/* Bottom fade transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <Card className="max-w-4xl mx-auto border-border bg-card hover:border-primary/50 transition-all duration-500 group">
          
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Insights & Strategies for Entrepreneurs
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover expert articles on AI, business automation, and growth strategies to help you stay ahead of the curve.
            </p>
            
            <Link to="/blog">
              <Button size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                Explore Our Blog →
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BlogCTA;
