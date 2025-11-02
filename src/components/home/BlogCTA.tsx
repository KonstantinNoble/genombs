import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

const BlogCTA = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Insights & Strategies for Entrepreneurs
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Discover expert articles on AI, business automation, and growth strategies to help you stay ahead of the curve.
          </p>
          
          <Link to="/blog">
            <Button size="lg" className="group">
              Explore Our Blog
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogCTA;
