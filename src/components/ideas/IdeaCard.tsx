import { ExternalLink, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IdeaRating from "./IdeaRating";
import { formatDistanceToNow } from "date-fns";

interface IdeaCardProps {
  id: string;
  displayName: string;
  content: string;
  websiteUrl?: string | null;
  createdAt: string;
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  isOwner?: boolean;
  isLoggedIn?: boolean;
  onRate?: (ideaId: string, rating: number) => void;
  onDelete?: (ideaId: string) => void;
}

const IdeaCard = ({
  id,
  displayName,
  content,
  websiteUrl,
  createdAt,
  averageRating,
  totalRatings,
  userRating,
  isOwner = false,
  isLoggedIn = false,
  onRate,
  onDelete,
}: IdeaCardProps) => {
  const handleRate = (rating: number) => {
    if (onRate) {
      onRate(id, rating);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {displayName || "Anonymous"}
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-foreground mb-4 whitespace-pre-wrap break-words">
          {content}
        </p>

        {websiteUrl && (
          <a
            href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {websiteUrl.replace(/^https?:\/\//, "").slice(0, 40)}
            {websiteUrl.length > 40 ? "..." : ""}
          </a>
        )}

        <div className="flex items-center justify-between">
          <IdeaRating
            averageRating={averageRating}
            totalRatings={totalRatings}
            userRating={userRating}
            onRate={isLoggedIn && !isOwner ? handleRate : undefined}
            disabled={!isLoggedIn || isOwner}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
