import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Reply, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  isModerator?: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
}

const MAX_DEPTH = 3;

const CommentItem = ({
  comment,
  currentUserId,
  isLoggedIn,
  isAdmin = false,
  isModerator = false,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === comment.user_id;
  const canDelete = isOwner || isAdmin || isModerator;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent("");
    setShowReplyForm(false);
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(comment.id);
    setDeleting(false);
  };

  return (
    <div className={`${depth > 0 ? "ml-4 pl-4 border-l-2 border-border" : ""}`}>
      <div className="bg-muted/30 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">
              {comment.display_name || "Anonymous"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-1">
            {isLoggedIn && depth < MAX_DEPTH && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3.5 w-3.5 mr-1" />
                Reply
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleting}
                title={isOwner ? "Delete your comment" : "Delete comment (moderator)"}
              >
                {deleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="mt-2 ml-4 space-y-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Reply to ${comment.display_name || "Anonymous"}...`}
            className="min-h-[60px] resize-none text-sm"
          />
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reply"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              isModerator={isModerator}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
