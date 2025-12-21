import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaRatingProps {
  averageRating: number;
  totalRatings: number;
  userRating?: number;
  onRate?: (rating: number) => void;
  disabled?: boolean;
}

const IdeaRating = ({ 
  averageRating, 
  totalRatings, 
  userRating, 
  onRate, 
  disabled = false 
}: IdeaRatingProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (rating: number) => {
    if (!disabled && onRate) {
      onRate(rating);
    }
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={cn(
              "transition-all duration-150",
              disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                "h-4 w-4 transition-colors",
                star <= displayRating
                  ? "fill-amber-400 text-amber-400"
                  : star <= averageRating
                  ? "fill-amber-400/50 text-amber-400/50"
                  : "fill-transparent text-muted-foreground/40"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {averageRating.toFixed(1)} ({totalRatings})
      </span>
    </div>
  );
};

export default IdeaRating;
