import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";

const BlogCTA = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background via-[hsl(260,30%,96%)] to-background relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[hsl(280,85%,65%)]/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[hsl(340,85%,65%)]/5 rounded-full blur-[100px]" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(280,85%,65%,0.04)_1px,transparent_1px),linear-gradient(to_bottom,hsl(280,85%,65%,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" aria-hidden="true" />
      
      <div className="container relative mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:border-secondary/50 transition-all duration-500 hover:shadow-[0_20px_50px_hsl(280,85%,65%/0.2)] group overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
          
          <div className="relative z-10 p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(280,85%,65%)] to-[hsl(340,85%,65%)] mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:bg-gradient-to-r group-hover:from-[hsl(280,85%,65%)] group-hover:to-[hsl(340,85%,65%)] group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
              Insights & Strategies for Entrepreneurs
            </h2>
            
            <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover expert articles on AI, business automation, and growth strategies to help you stay ahead of the curve.
            </p>
            
            <Link to="/blog">
              <Button size="lg" className="group/btn shadow-lg hover:shadow-[0_10px_40px_hsl(280,85%,65%/0.3)] transition-all duration-300">
                Explore Our Blog
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default BlogCTA;
