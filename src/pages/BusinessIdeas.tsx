import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IdeaCard from "@/components/ideas/IdeaCard";
import PostIdeaDialog from "@/components/ideas/PostIdeaDialog";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, LogIn, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

type SortMode = "latest" | "top";

const ITEMS_PER_PAGE = 20;

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
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [ideas, setIdeas] = useState<IdeaWithRatings[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [remainingPosts, setRemainingPosts] = useState(1);
  const [nextPostTime, setNextPostTime] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchIdeas = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    
    if (reset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    // Use the optimized view for aggregated stats
    const query = supabase
      .from("ideas_with_stats")
      .select("id, user_id, content, website_url, created_at, average_rating, total_ratings");

    // Apply sorting
    if (sortMode === "top") {
      query.order("average_rating", { ascending: false });
    } else {
      query.order("created_at", { ascending: false });
    }

    // Apply pagination
    const { data: ideasData, error: ideasError } = await query
      .range(currentOffset, currentOffset + ITEMS_PER_PAGE - 1);

    if (ideasError) {
      console.error("Error fetching ideas:", ideasError);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    // Check if there are more items
    setHasMore((ideasData || []).length === ITEMS_PER_PAGE);

    // Get unique user IDs to fetch profiles
    const userIds = [...new Set((ideasData || []).map((i) => i.user_id))];
    
    // Fetch profiles for display names
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const profilesMap = new Map(
      (profilesData || []).map((p) => [p.id, p.display_name])
    );

    // Fetch user's ratings only for the loaded ideas (if logged in)
    let userRatingsMap = new Map<string, number>();
    if (user && ideasData && ideasData.length > 0) {
      const ideaIds = ideasData.map(i => i.id);
      const { data: userRatings } = await supabase
        .from("idea_ratings")
        .select("idea_id, rating")
        .eq("user_id", user.id)
        .in("idea_id", ideaIds);
      
      userRatingsMap = new Map(
        (userRatings || []).map((r) => [r.idea_id, r.rating])
      );
    }

    // Process ideas - stats already come from the view
    const processedIdeas: IdeaWithRatings[] = (ideasData || []).map((idea) => ({
      id: idea.id,
      user_id: idea.user_id,
      content: idea.content,
      website_url: idea.website_url,
      created_at: idea.created_at,
      display_name: profilesMap.get(idea.user_id) || null,
      average_rating: Number(idea.average_rating) || 0,
      total_ratings: idea.total_ratings || 0,
      user_rating: userRatingsMap.get(idea.id),
    }));

    if (reset) {
      setIdeas(processedIdeas);
    } else {
      setIdeas(prev => [...prev, ...processedIdeas]);
    }

    setOffset(currentOffset + ITEMS_PER_PAGE);
    setLoading(false);
    setLoadingMore(false);
  }, [user, sortMode, offset]);

  const fetchRemainingPosts = useCallback(async () => {
    if (!user) {
      setRemainingPosts(0);
      setNextPostTime(null);
      return;
    }

    const { data: remaining, error: remainingError } = await supabase.rpc("get_remaining_idea_posts", {
      p_user_id: user.id,
    });

    if (!remainingError && remaining !== null) {
      const numRemaining = Number(remaining);
      setRemainingPosts(numRemaining);
      
      // Fetch next post time if limit is reached
      if (numRemaining <= 0) {
        const { data: nextTime } = await supabase.rpc("get_next_idea_post_time", {
          p_user_id: user.id,
        });
        setNextPostTime(nextTime);
      } else {
        setNextPostTime(null);
      }
    }
  }, [user]);

  // Initial load and reload on sort change
  useEffect(() => {
    fetchIdeas(true);
  }, [sortMode, user]);

  useEffect(() => {
    fetchRemainingPosts();
  }, [fetchRemainingPosts]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchIdeas(false);
    }
  };

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

    // Record the post attempt (this updates the timestamp for rate limiting)
    if (!error) {
      await supabase.rpc("record_idea_post", { p_user_id: user.id });
    }

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

    fetchIdeas(true);
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

    // Optimistic update for user rating
    setIdeas(prev => prev.map(idea => 
      idea.id === ideaId 
        ? { ...idea, user_rating: rating }
        : idea
    ));

    // Refresh to get updated averages
    fetchIdeas(true);
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

    // Remove from local state immediately
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
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
                nextPostTime={nextPostTime}
                onSubmit={handlePostIdea}
                isPremium={isPremium}
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

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-6">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BusinessIdeas;
