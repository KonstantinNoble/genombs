import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircle, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CommentItem from "./CommentItem";

interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  display_name: string | null;
  replies?: Comment[];
}

interface CommentSectionProps {
  ideaId: string;
  isLoggedIn: boolean;
}

const CommentSection = ({ ideaId, isLoggedIn }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isAdmin, isModerator } = useUserRole(user?.id);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [nextCommentTime, setNextCommentTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const fetchNextCommentTime = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase.rpc("get_next_comment_time", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error fetching next comment time:", error);
      return;
    }

    if (data) {
      setNextCommentTime(new Date(data));
    } else {
      setNextCommentTime(null);
    }
  }, [user]);

  // Update timer every minute
  useEffect(() => {
    if (!nextCommentTime) {
      setTimeRemaining("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      if (nextCommentTime <= now) {
        setNextCommentTime(null);
        setTimeRemaining("");
        return;
      }
      setTimeRemaining(formatDistanceToNow(nextCommentTime, { addSuffix: true }));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextCommentTime]);

  // Fetch next comment time when expanded
  useEffect(() => {
    if (isExpanded && user) {
      fetchNextCommentTime();
    }
  }, [isExpanded, user, fetchNextCommentTime]);

  const fetchComments = async () => {
    setLoading(true);
    
    const { data: commentsData, error } = await supabase
      .from("idea_comments")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set((commentsData || []).map(c => c.user_id))];
    
    // Fetch profiles for display names
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

    const profilesMap = new Map(
      (profilesData || []).map(p => [p.id, p.display_name])
    );

    // Add display names to comments
    const commentsWithNames: Comment[] = (commentsData || []).map(c => ({
      ...c,
      display_name: profilesMap.get(c.user_id) || null,
    }));

    // Build nested structure
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    commentsWithNames.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    commentsWithNames.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies!.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    setComments(rootComments);
    setCommentCount(commentsData?.length || 0);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch count on mount
    const fetchCount = async () => {
      const { count } = await supabase
        .from("idea_comments")
        .select("*", { count: "exact", head: true })
        .eq("idea_id", ideaId);
      setCommentCount(count || 0);
    };
    fetchCount();
  }, [ideaId]);

  useEffect(() => {
    if (isExpanded) {
      fetchComments();
    }
  }, [isExpanded, ideaId]);

  const checkCommentLimit = async (): Promise<boolean> => {
    if (!user) return false;
    
    const { data, error } = await supabase.rpc("check_comment_limit", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error checking comment limit:", error);
      return false;
    }

    return data === true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);

    // Check rate limit
    const canComment = await checkCommentLimit();
    if (!canComment) {
      toast({
        title: "Rate limit reached",
        description: "You can only post 1 comment every 10 hours. Please try again later.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("idea_comments").insert({
      idea_id: ideaId,
      user_id: user.id,
      content: newComment.trim(),
      parent_id: null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post your comment.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    setNewComment("");
    setSubmitting(false);
    fetchComments();
    fetchNextCommentTime();
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!user) return;

    // Check rate limit for replies too
    const canComment = await checkCommentLimit();
    if (!canComment) {
      toast({
        title: "Rate limit reached",
        description: "You can only post 1 comment every 10 hours. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("idea_comments").insert({
      idea_id: ideaId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post your reply.",
        variant: "destructive",
      });
      return;
    }

    fetchComments();
    fetchNextCommentTime();
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    // Admins/moderators can delete any comment, regular users only their own
    let query = supabase
      .from("idea_comments")
      .delete()
      .eq("id", commentId);

    // If not admin/moderator, restrict to own comments only
    if (!isAdmin && !isModerator) {
      query = query.eq("user_id", user.id);
    }

    const { error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete the comment.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Comment deleted",
      description: isAdmin || isModerator 
        ? "The comment has been removed." 
        : "Your comment has been removed.",
    });

    fetchComments();
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount} {commentCount === 1 ? "Comment" : "Comments"}
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Rate limit timer */}
          {nextCommentTime && timeRemaining && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              <Clock className="h-4 w-4" />
              <span>Next comment available {timeRemaining}</span>
            </div>
          )}

          {/* New comment form */}
          {isLoggedIn ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, 2000))}
                placeholder={nextCommentTime ? "You've reached your comment limit..." : "Write a comment..."}
                className="min-h-[80px] resize-none"
                disabled={!!nextCommentTime}
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs ${newComment.length >= 1800 ? (newComment.length >= 2000 ? "text-destructive" : "text-warning") : "text-muted-foreground"}`}>
                  {newComment.length}/2,000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !newComment.trim() || !!nextCommentTime || newComment.length > 2000}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign in to leave a comment.
            </p>
          )}

          {/* Comments list */}
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  isLoggedIn={isLoggedIn}
                  isAdmin={isAdmin}
                  isModerator={isModerator}
                  onReply={handleReply}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
