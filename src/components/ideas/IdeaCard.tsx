import { ExternalLink, Trash2, Laptop, Smartphone, ShoppingCart, Users, Brain, Banknote, HeartPulse, GraduationCap, Cpu, Briefcase, FileText, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import IdeaRating from "./IdeaRating";
import CommentSection from "./CommentSection";
import { formatDistanceToNow } from "date-fns";
import type { IdeaCategory } from "./PostIdeaDialog";

const CATEGORY_CONFIG: Record<IdeaCategory, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  "SaaS": { icon: Laptop, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  "Mobile App": { icon: Smartphone, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  "E-Commerce": { icon: ShoppingCart, color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  "Marketplace": { icon: Users, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  "AI/ML": { icon: Brain, color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20" },
  "FinTech": { icon: Banknote, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  "HealthTech": { icon: HeartPulse, color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  "EdTech": { icon: GraduationCap, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  "Hardware": { icon: Cpu, color: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  "Service": { icon: Briefcase, color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  "Content": { icon: FileText, color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
  "Other": { icon: MoreHorizontal, color: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
};

interface IdeaCardProps {
  id: string;
  displayName: string;
  content: string;
  category?: IdeaCategory | null;
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
  category,
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

  const categoryConfig = category ? CATEGORY_CONFIG[category] : null;
  const CategoryIcon = categoryConfig?.icon;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-elegant transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">
              {displayName || "Anonymous"}
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
            {category && categoryConfig && CategoryIcon && (
              <>
                <span>•</span>
                <Badge variant="outline" className={`text-xs gap-1 ${categoryConfig.color}`}>
                  <CategoryIcon className="h-3 w-3" />
                  {category}
                </Badge>
              </>
            )}
          </div>
          {isOwner && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
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

        <CommentSection ideaId={id} isLoggedIn={isLoggedIn} />
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
