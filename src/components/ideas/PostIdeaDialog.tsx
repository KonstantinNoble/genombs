import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, Crown, Lock, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface PostIdeaDialogProps {
  remainingPosts: number;
  nextPostTime: string | null;
  onSubmit: (content: string, websiteUrl?: string) => Promise<boolean>;
  disabled?: boolean;
  isPremium?: boolean;
}

const MAX_CONTENT_LENGTH = 500;
const MAX_URL_LENGTH = 100;

// Countdown Timer Component
const CountdownTimer = ({ targetTime }: { targetTime: string }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetTime).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft("Available now!");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-auto">
      <Clock className="h-3.5 w-3.5" />
      <span>Next post in: <span className="font-mono font-medium text-foreground">{timeLeft}</span></span>
    </div>
  );
};

const PostIdeaDialog = ({ remainingPosts, nextPostTime, onSubmit, disabled, isPremium = false }: PostIdeaDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content.length > MAX_CONTENT_LENGTH) return;
    if (websiteUrl && (websiteUrl.length > MAX_URL_LENGTH || !websiteUrl.startsWith("https://"))) return;

    setIsSubmitting(true);
    const success = await onSubmit(content.trim(), websiteUrl.trim() || undefined);
    setIsSubmitting(false);

    if (success) {
      setContent("");
      setWebsiteUrl("");
      setOpen(false);
    }
  };

  const isValidUrl = !websiteUrl || (websiteUrl.startsWith("https://") && websiteUrl.length <= MAX_URL_LENGTH);
  const isValid = content.trim().length > 0 && 
                  content.length <= MAX_CONTENT_LENGTH && 
                  isValidUrl;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || remainingPosts <= 0} className="gap-2">
          <Lightbulb className="h-4 w-4" />
          Share Your Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Business Idea</DialogTitle>
          <DialogDescription>
            Share your business idea with the community. Be creative and concise!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="idea-content">Your Idea</Label>
            <Textarea
              id="idea-content"
              placeholder="Describe your business idea..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={MAX_CONTENT_LENGTH}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${content.length > MAX_CONTENT_LENGTH ? 'text-destructive' : 'text-muted-foreground'}`}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website-url" className="flex items-center gap-2">
              Website URL (optional)
              {!isPremium && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </Label>
            {isPremium ? (
              <>
                <Input
                  id="website-url"
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  maxLength={MAX_URL_LENGTH}
                  className={websiteUrl && !websiteUrl.startsWith("https://") ? "border-destructive" : ""}
                />
                {websiteUrl && !websiteUrl.startsWith("https://") && (
                  <p className="text-xs text-destructive">URL must start with https://</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {websiteUrl.length}/{MAX_URL_LENGTH} characters
                </p>
              </>
            ) : (
              <>
                <Input
                  disabled
                  placeholder="https://example.com"
                  className="bg-muted cursor-not-allowed opacity-60"
                />
                <Link 
                  to="/pricing" 
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Upgrade to Premium to promote your website
                </Link>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {remainingPosts > 0 ? (
            <p className="text-xs text-muted-foreground mr-auto">
              {remainingPosts}/1 post available
            </p>
          ) : nextPostTime ? (
            <CountdownTimer targetTime={nextPostTime} />
          ) : (
            <p className="text-xs text-muted-foreground mr-auto">
              No posts available
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting || remainingPosts <= 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post Idea"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostIdeaDialog;
