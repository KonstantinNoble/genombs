import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IdeaCard from "@/components/ideas/IdeaCard";
import PostIdeaDialog from "@/components/ideas/PostIdeaDialog";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

type SortMode = "latest" | "top";

interface IdeaWithRatings {
  id: string;
  user_id: string;
  content: string;
  website_url: string | null;
  created_at: string;
  display_name: string | null;
  average_rating: number;
  total_ratings: number;
  user_rating?: number;
}

const BusinessIdeas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<IdeaWithRatings[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [remainingPosts, setRemainingPosts] = useState(2);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);

    // Fetch ideas with profiles
    const { data: ideasData, error: ideasError } = await supabase
      .from("business_ideas")
      .select(`
        id,
        user_id,
        content,
        website_url,
        created_at,
        profiles!business_ideas_user_id_fkey (display_name)
      `)
      .order("created_at", { ascending: false });

    if (ideasError) {
      console.error("Error fetching ideas:", ideasError);
      setLoading(false);
      return;
    }

    // Fetch all ratings
    const { data: ratingsData } = await supabase
      .from("idea_ratings")
      .select("idea_id, rating, user_id");

    // Process ideas with ratings
    const processedIdeas: IdeaWithRatings[] = (ideasData || []).map((idea: any) => {
      const ideaRatings = (ratingsData || []).filter((r) => r.idea_id === idea.id);
      const totalRatings = ideaRatings.length;
      const averageRating = totalRatings > 0
        ? ideaRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;
      const userRating = user
        ? ideaRatings.find((r) => r.user_id === user.id)?.rating
        : undefined;

      return {
        id: idea.id,
        user_id: idea.user_id,
        content: idea.content,
        website_url: idea.website_url,
        created_at: idea.created_at,
        display_name: idea.profiles?.display_name || null,
        average_rating: averageRating,
        total_ratings: totalRatings,
        user_rating: userRating,
      };
    });

    // Sort based on mode
    if (sortMode === "top") {
      processedIdeas.sort((a, b) => b.average_rating - a.average_rating);
    }

    setIdeas(processedIdeas);
    setLoading(false);
  }, [user, sortMode]);

  const fetchRemainingPosts = useCallback(async () => {
    if (!user) {
      setRemainingPosts(0);
      return;
    }

    const { data, error } = await supabase.rpc("get_remaining_idea_posts", {
      p_user_id: user.id,
    });

    if (!error && data !== null) {
      setRemainingPosts(data);
    }
  }, [user]);

  useEffect(() => {
    fetchIdeas();
    fetchRemainingPosts();
  }, [fetchIdeas, fetchRemainingPosts]);

  const handlePostIdea = async (content: string, websiteUrl?: string): Promise<boolean> => {
    if (!user) return false;

    // Check rate limit
    const { data: canPost } = await supabase.rpc("check_idea_post_limit", {
      p_user_id: user.id,
    });

    if (!canPost) {
      toast({
        title: "Post limit reached",
        description: "You can only post 2 ideas per 24 hours.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase.from("business_ideas").insert({
      user_id: user.id,
      content,
      website_url: websiteUrl || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post your idea. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Idea posted!",
      description: "Your business idea has been shared with the community.",
    });

    fetchIdeas();
    fetchRemainingPosts();
    return true;
  };

  const handleRate = async (ideaId: string, rating: number) => {
    if (!user) return;

    // Check if user already rated - upsert
    const { error } = await supabase
      .from("idea_ratings")
      .upsert(
        {
          idea_id: ideaId,
          user_id: user.id,
          rating,
        },
        { onConflict: "idea_id,user_id" }
      );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your rating.",
        variant: "destructive",
      });
      return;
    }

    fetchIdeas();
  };

  const handleDelete = async (ideaId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("business_ideas")
      .delete()
      .eq("id", ideaId)
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete your idea.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Idea deleted",
      description: "Your idea has been removed.",
    });

    fetchIdeas();
    fetchRemainingPosts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-3">
              Business Ideas Community
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Share your business ideas, get feedback from the community, and discover inspiring concepts from other entrepreneurs.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant={sortMode === "latest" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode("latest")}
                className="gap-1.5"
              >
                <Clock className="h-4 w-4" />
                Latest
              </Button>
              <Button
                variant={sortMode === "top" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode("top")}
                className="gap-1.5"
              >
                <TrendingUp className="h-4 w-4" />
                Top Rated
              </Button>
            </div>

            {user ? (
              <PostIdeaDialog
                remainingPosts={remainingPosts}
                onSubmit={handlePostIdea}
              />
            ) : (
              <Button asChild variant="outline" className="gap-2">
                <Link to="/auth">
                  <LogIn className="h-4 w-4" />
                  Sign in to post
                </Link>
              </Button>
            )}
          </div>

          {/* Ideas List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                No ideas have been shared yet. Be the first!
              </p>
              {!user && (
                <Button asChild>
                  <Link to="/auth">Sign in to share your idea</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  id={idea.id}
                  displayName={idea.display_name || "Anonymous"}
                  content={idea.content}
                  websiteUrl={idea.website_url}
                  createdAt={idea.created_at}
                  averageRating={idea.average_rating}
                  totalRatings={idea.total_ratings}
                  userRating={idea.user_rating}
                  isOwner={user?.id === idea.user_id}
                  isLoggedIn={!!user}
                  onRate={handleRate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessIdeas;
