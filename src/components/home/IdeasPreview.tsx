import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface IdeaPreview {
  id: string;
  content: string;
  average_rating: number | null;
  total_ratings: number | null;
}

const IdeasPreview = () => {
  const [ideas, setIdeas] = useState<IdeaPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { ref: sectionRef, isVisible } = useScrollReveal();

  useEffect(() => {
    const fetchTopIdeas = async () => {
      const { data, error } = await supabase
        .from("ideas_with_stats")
        .select("id, content, average_rating, total_ratings")
        .not("average_rating", "is", null)
        .order("average_rating", { ascending: false })
        .order("total_ratings", { ascending: false })
        .limit(3);

      if (!error && data) {
        setIdeas(data);
      }
      setIsLoading(false);
    };

    fetchTopIdeas();
  }, []);

  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded mt-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (ideas.length === 0) {
    return null;
  }

  return (
    <div
      ref={sectionRef}
      className={`py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Business Ideas Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Share your business ideas, get real feedback from entrepreneurs worldwide. 
            Rate, discuss, and discover innovative concepts that could shape the future.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
              Share Ideas
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
              Get Ratings
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
              Discover Trends
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {ideas.map((idea, index) => (
            <Card
              key={idea.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Top {index + 1}
                  </span>
                </div>
                <p className="text-foreground leading-relaxed mb-6 min-h-[72px]">
                  {truncateContent(idea.content)}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold text-primary">
                      {idea.average_rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 5</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {idea.total_ratings || 0} {idea.total_ratings === 1 ? "vote" : "votes"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/ideas">
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-medium"
            >
              Explore All Ideas
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IdeasPreview;
